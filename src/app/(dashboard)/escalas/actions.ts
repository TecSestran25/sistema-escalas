/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/escalas/actions.ts
// src/app/(dashboard)/escalas/actions.ts
"use server";

import { firestore } from "@/lib/firebase";
import { doc, getDoc, collection, writeBatch, Timestamp, updateDoc, query, where, getDocs, addDoc } from "firebase/firestore";
import { addDays, differenceInDays, startOfDay, endOfDay } from "date-fns";
import { revalidatePath } from "next/cache";
import { z } from "zod";
// Interface para a configuração do template de ciclo
interface CicloConfig {
  trabalha: number;
  folga: number;
}

// Esquema de validação para os dados do formulário de geração
const GerarTurnosSchema = z.object({
    postoId: z.string().min(1, "É necessário selecionar um posto."),
    templateId: z.string().min(1, "É necessário selecionar um template."),
    dataInicio: z.string().min(10, "Data de início inválida"), // Ex: "2025-08-31"
    dataFim: z.string().min(10, "Data de fim inválida"),
});

async function isVigilanteOcupado(vigilanteId: string, data: Date): Promise<boolean> {
    const inicioDoDia = startOfDay(data);
    const fimDoDia = endOfDay(data);
    const turnosCollection = collection(firestore, "turnos");

    const q = query(turnosCollection,
        where("vigilanteId", "==", vigilanteId),
        where("startDateTime", ">=", Timestamp.fromDate(inicioDoDia)),
        where("startDateTime", "<=", Timestamp.fromDate(fimDoDia))
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
}

export async function preencherEscalaAutomaticamente(prevState: any, formData: FormData) {
    const schema = z.object({
        vigilanteId: z.string().min(1, "Selecione um vigilante."),
        postoId: z.string().min(1, "Selecione um posto."),
        templateId: z.string().min(1, "Selecione um template."),
        dataInicio: z.string().min(10, "Data de início inválida"),
        dataFim: z.string().min(10, "Data de fim inválida"),
    });

    const validatedFields = schema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return { message: "Dados inválidos." };
    }

    const { vigilanteId, postoId, templateId, dataInicio: dataInicioStr, dataFim: dataFimStr } = validatedFields.data;
    const dataInicio = new Date(`${dataInicioStr}T00:00:00`);
    const dataFim = new Date(`${dataFimStr}T00:00:00`);

    if (dataInicio > dataFim) {
        return { message: "A data de início não pode ser posterior à data de fim." };
    }

    try {
        const templateRef = doc(firestore, "turnoTemplates", templateId);
        const templateSnap = await getDoc(templateRef);
        if (!templateSnap.exists() || templateSnap.data().type !== 'ciclo') {
            return { message: "Template de ciclo inválido." };
        }

        const config = templateSnap.data().config as { trabalha: number; folga: number; };
        const cicloTotal = config.trabalha + config.folga;
        const duracaoEmDias = differenceInDays(dataFim, dataInicio);
        const batch = writeBatch(firestore);
        const turnosCollection = collection(firestore, "turnos");
        let conflitosEncontrados = 0;

        for (let i = 0; i <= duracaoEmDias; i++) {
            const diaAtual = addDays(dataInicio, i);
            const contadorCiclo = i % cicloTotal;

            if (contadorCiclo < config.trabalha) {
                // VERIFICAÇÃO DE CONFLITO ANTES DE CRIAR O TURNO
                if (await isVigilanteOcupado(vigilanteId, diaAtual)) {
                    conflitosEncontrados++;
                    continue; // Pula este dia, pois o vigilante já está ocupado
                }

                const turnoRef = doc(turnosCollection);
                const inicioTurno = new Date(diaAtual); inicioTurno.setHours(6, 0, 0, 0);
                const fimTurno = new Date(diaAtual); fimTurno.setHours(18, 0, 0, 0);

                batch.set(turnoRef, {
                    postoId,
                    vigilanteId,
                    startDateTime: Timestamp.fromDate(inicioTurno),
                    endDateTime: Timestamp.fromDate(fimTurno),
                    status: "preenchido",
                });
            }
        }

        await batch.commit();

        let successMessage = "Escala preenchida com sucesso!";
        if (conflitosEncontrados > 0) {
            successMessage += ` (${conflitosEncontrados} dia(s) foram ignorados por conflito de escala).`;
        }

        revalidatePath("/escalas");
        return { success: true, message: successMessage };
    } catch (error) {
        console.error("Erro no preenchimento automático:", error);
        return { message: "Ocorreu um erro no servidor." };
    }
}

export async function alocarVigilante(turnoId: string, vigilanteId: string, dataDoTurno: Date) {
    try {
        // 1. VERIFICAR SE O VIGILANTE JÁ ESTÁ OCUPADO
        if (await isVigilanteOcupado(vigilanteId, dataDoTurno)) {
            return { success: false, message: "Este vigilante já está escalado neste dia." };
        }

        // 2. Se não estiver ocupado, aloca
        const turnoRef = doc(firestore, "turnos", turnoId);
        await updateDoc(turnoRef, {
            vigilanteId: vigilanteId,
            status: "preenchido",
        });
        revalidatePath("/escalas");
        return { success: true, message: "Vigilante alocado com sucesso!" };
    } catch (error) {
        console.error("Erro ao alocar vigilante:", error);
        return { success: false, message: "Erro ao alocar vigilante." };
    }
}

export async function criarEAlocarTurno(
    postoId: string,
    vigilanteId: string,
    dataDoTurno: Date
) {
    try {
        // 1. VERIFICAR SE O VIGILANTE JÁ ESTÁ OCUPADO
        if (await isVigilanteOcupado(vigilanteId, dataDoTurno)) {
            return { success: false, message: "Este vigilante já está escalado neste dia." };
        }

        // 2. Se não estiver ocupado, cria e aloca
        const turnosCollection = collection(firestore, "turnos");
        const inicioTurno = new Date(dataDoTurno);
        inicioTurno.setHours(6, 0, 0, 0);
        const fimTurno = new Date(dataDoTurno);
        fimTurno.setHours(18, 0, 0, 0);

        await addDoc(turnosCollection, {
            postoId,
            vigilanteId,
            startDateTime: Timestamp.fromDate(inicioTurno),
            endDateTime: Timestamp.fromDate(fimTurno),
            status: "preenchido",
        });

        revalidatePath("/escalas");
        return { success: true, message: "Turno criado e alocado com sucesso." };
    } catch (error) {
        console.error("Erro ao criar e alocar turno:", error);
        return { success: false, message: "Erro ao criar o turno." };
    }
}

// A nossa nova e única Server Action para a página de escalas
export async function gerarTurnos(prevState: any, formData: FormData) {
    const validatedFields = GerarTurnosSchema.safeParse({
        postoId: formData.get("postoId"),
        templateId: formData.get("templateId"),
        dataInicio: formData.get("dataInicio"),
        dataFim: formData.get("dataFim"),
    });

    if (!validatedFields.success) {
        return { message: "Dados inválidos. Por favor, preencha todos os campos." };
    }

    const { postoId, templateId, dataInicio: dataInicioStr, dataFim: dataFimStr } = validatedFields.data;

    const dataInicio = new Date(`${dataInicioStr}T00:00:00`);
    const dataFim = new Date(`${dataFimStr}T00:00:00`);

    if (dataInicio > dataFim) {
        return { message: "A data de início не pode ser posterior à data de fim." };
    }

    try {
        const templateRef = doc(firestore, "turnoTemplates", templateId);
        const templateSnap = await getDoc(templateRef);

        if (!templateSnap.exists() || templateSnap.data().type !== 'ciclo') {
            return { message: "Template de ciclo inválido ou não encontrado." };
        }

        const config = templateSnap.data().config as CicloConfig;
        const cicloTotal = config.trabalha + config.folga;
        const batch = writeBatch(firestore);
        const turnosCollection = collection(firestore, "turnos");
        
        // 2. LÓGICA DO CICLO REFATORADA
        const duracaoEmDias = differenceInDays(dataFim, dataInicio);

        for (let i = 0; i <= duracaoEmDias; i++) {
            const diaAtual = addDays(dataInicio, i);
            const contadorCiclo = i % cicloTotal;

            // Se o contador estiver dentro da janela de dias de trabalho, cria um turno
            if (contadorCiclo < config.trabalha) {
                const turnoRef = doc(turnosCollection);
                
                // Criamos novas datas para os Timestamps para evitar mutações
                const inicioTurno = new Date(diaAtual);
                inicioTurno.setHours(6, 0, 0, 0); // Ex: Turno das 06:00

                const fimTurno = new Date(diaAtual);
                fimTurno.setHours(18, 0, 0, 0); // às 18:00

                batch.set(turnoRef, {
                    postoId: postoId,
                    startDateTime: Timestamp.fromDate(inicioTurno),
                    endDateTime: Timestamp.fromDate(fimTurno),
                    status: "vago",
                });
            }
        }

        await batch.commit();

    } catch (error) {
        console.error("Erro ao gerar turnos:", error);
        return { message: "Ocorreu um erro no servidor ao tentar gerar os turnos." };
    }

    revalidatePath("/escalas");
    return { success: true, message: "Turnos gerados com sucesso!" };
}
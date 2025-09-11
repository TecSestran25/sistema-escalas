/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/escalas/actions.ts
"use server";

import { firestore } from "@/lib/firebase";
import { doc, getDoc, collection, writeBatch, Timestamp, updateDoc, query, where, getDocs, addDoc } from "firebase/firestore";
import { addDays, differenceInDays, startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// --- INTERFACES ATUALIZADAS E NOVAS ---
interface CicloConfig {
  trabalha: number;
  folga: number;
}
interface FixoConfig {
    dias: ('seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom')[];
}
interface TurnoTemplate {
    type: 'ciclo' | 'fixo';
    horarioInicio: string; // "HH:mm"
    horarioFim: string;   // "HH:mm"
    config: CicloConfig | FixoConfig;
}
interface Turno {
    id: string;
    postoId: string;
    vigilanteId?: string;
    startDateTime: string;
    endDateTime: string;
}

// Mapeamento de dias da semana para o formato getDay() (Dom=0, Seg=1...)
const diaMap: { [key: string]: number } = {
    dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6
};

// --- FUNÇÕES DE LÓGICA ---

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

export async function getTurnosByMonth(date: Date): Promise<Turno[]> {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const turnosCollection = collection(firestore, "turnos");
    const q = query(turnosCollection,
        where('startDateTime', '>=', Timestamp.fromDate(start)),
        where('startDateTime', '<=', Timestamp.fromDate(end))
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            postoId: data.postoId,
            vigilanteId: data.vigilanteId,
            startDateTime: data.startDateTime.toDate().toISOString(),
            endDateTime: data.endDateTime.toDate().toISOString(),
        };
    });
}

// Helper para criar as datas de início e fim do turno
const criarDatasTurno = (dia: Date, horarioInicio: string, horarioFim: string): { inicio: Date, fim: Date } => {
    const [startHour, startMinute] = horarioInicio.split(':').map(Number);
    const [endHour, endMinute] = horarioFim.split(':').map(Number);

    const inicio = new Date(dia);
    inicio.setHours(startHour, startMinute, 0, 0);

    const fim = new Date(dia);
    // Se o turno termina no dia seguinte
    if (endHour < startHour || (endHour === startHour && endMinute < startMinute)) {
        fim.setDate(fim.getDate() + 1);
    }
    fim.setHours(endHour, endMinute, 0, 0);

    return { inicio, fim };
};


// --- SERVER ACTIONS ---

export async function gerarTurnos(prevState: any, formData: FormData) {
    const GerarTurnosSchema = z.object({
        postoId: z.string().min(1, "É necessário selecionar um posto."),
        templateId: z.string().min(1, "É necessário selecionar um template."),
        dataInicio: z.string().min(10, "Data de início inválida"),
        dataFim: z.string().min(10, "Data de fim inválida"),
    });

    const validatedFields = GerarTurnosSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return { message: "Dados inválidos." };
    }
    
    const { postoId, templateId, dataInicio: dataInicioStr, dataFim: dataFimStr } = validatedFields.data;
    const dataInicio = new Date(`${dataInicioStr}T00:00:00`);
    const dataFim = new Date(`${dataFimStr}T00:00:00`);

    if (dataInicio > dataFim) {
        return { message: "A data de início não pode ser posterior à data de fim." };
    }
    
    try {
        const templateRef = doc(firestore, "turnoTemplates", templateId);
        const templateSnap = await getDoc(templateRef);
        if (!templateSnap.exists()) {
            return { message: "Template não encontrado." };
        }
        
        const template = templateSnap.data() as TurnoTemplate;
        const batch = writeBatch(firestore);
        const turnosCollection = collection(firestore, "turnos");
        const duracaoEmDias = differenceInDays(dataFim, dataInicio);

        for (let i = 0; i <= duracaoEmDias; i++) {
            const diaAtual = addDays(dataInicio, i);
            let criarTurnoNesteDia = false;

            if (template.type === 'ciclo') {
                const config = template.config as CicloConfig;
                const cicloTotal = config.trabalha + config.folga;
                const contadorCiclo = i % cicloTotal;
                if (contadorCiclo < config.trabalha) {
                    criarTurnoNesteDia = true;
                }
            } else if (template.type === 'fixo') {
                const config = template.config as FixoConfig;
                const diaDaSemana = diaAtual.getDay(); // Domingo = 0, Segunda = 1...
                if (config.dias.some(diaConfig => diaMap[diaConfig] === diaDaSemana)) {
                    criarTurnoNesteDia = true;
                }
            }
            
            if (criarTurnoNesteDia) {
                const turnoRef = doc(turnosCollection);
                const { inicio, fim } = criarDatasTurno(diaAtual, template.horarioInicio, template.horarioFim);
                batch.set(turnoRef, {
                    postoId: postoId,
                    startDateTime: Timestamp.fromDate(inicio),
                    endDateTime: Timestamp.fromDate(fim),
                    status: "vago",
                });
            }
        }
        await batch.commit();
    } catch (error) {
        console.error("Erro ao gerar turnos:", error);
        return { message: "Ocorreu um erro no servidor." };
    }

    revalidatePath("/escalas");
    return { success: true, message: "Turnos gerados com sucesso!" };
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
    if (!validatedFields.success) { return { message: "Dados inválidos." }; }

    const { vigilanteId, postoId, templateId, dataInicio: dataInicioStr, dataFim: dataFimStr } = validatedFields.data;
    const dataInicio = new Date(`${dataInicioStr}T00:00:00`);
    const dataFim = new Date(`${dataFimStr}T00:00:00`);

    if (dataInicio > dataFim) { return { message: "A data de início não pode ser posterior à data de fim." }; }

    try {
        const templateRef = doc(firestore, "turnoTemplates", templateId);
        const templateSnap = await getDoc(templateRef);
        if (!templateSnap.exists()) { return { message: "Template inválido." }; }
        
        const template = templateSnap.data() as TurnoTemplate;
        const duracaoEmDias = differenceInDays(dataFim, dataInicio);
        const batch = writeBatch(firestore);
        const turnosCollection = collection(firestore, "turnos");
        let conflitosEncontrados = 0;

        for (let i = 0; i <= duracaoEmDias; i++) {
            const diaAtual = addDays(dataInicio, i);
            let criarTurnoNesteDia = false;
            
            if (template.type === 'ciclo') {
                const config = template.config as CicloConfig;
                if (i % (config.trabalha + config.folga) < config.trabalha) criarTurnoNesteDia = true;
            } else if (template.type === 'fixo') {
                const config = template.config as FixoConfig;
                if (config.dias.some(dia => diaMap[dia] === diaAtual.getDay())) criarTurnoNesteDia = true;
            }

            if (criarTurnoNesteDia) {
                if (await isVigilanteOcupado(vigilanteId, diaAtual)) {
                    conflitosEncontrados++;
                    continue;
                }
                const turnoRef = doc(turnosCollection);
                const { inicio, fim } = criarDatasTurno(diaAtual, template.horarioInicio, template.horarioFim);
                batch.set(turnoRef, {
                    postoId, vigilanteId,
                    startDateTime: Timestamp.fromDate(inicio),
                    endDateTime: Timestamp.fromDate(fim),
                    status: "preenchido",
                });
            }
        }

        await batch.commit();

        let successMessage = "Escala preenchida com sucesso!";
        if (conflitosEncontrados > 0) {
            successMessage += ` (${conflitosEncontrados} dia(s) ignorados por conflito).`;
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
        if (await isVigilanteOcupado(vigilanteId, dataDoTurno)) {
            return { success: false, message: "Este vigilante já está escalado neste dia." };
        }
        const turnoRef = doc(firestore, "turnos", turnoId);
        await updateDoc(turnoRef, { vigilanteId: vigilanteId, status: "preenchido" });
        revalidatePath("/escalas");
        return { success: true, message: "Vigilante alocado com sucesso!" };
    } catch (error) {
        console.error("Erro ao alocar vigilante:", error);
        return { success: false, message: "Erro ao alocar vigilante." };
    }
}

export async function desalocarVigilante(turnoId: string) {
    try {
        const turnoRef = doc(firestore, "turnos", turnoId);
        await updateDoc(turnoRef, {
            vigilanteId: null,
            status: "vago",
        });
        revalidatePath("/escalas");
        return { success: true, message: "Vigilante desalocado com sucesso!" };
    } catch (error) {
        console.error("Erro ao desalocar vigilante:", error);
        return { success: false, message: "Erro ao desalocar vigilante." };
    }
}

export async function criarEAlocarTurno(
    postoId: string,
    vigilanteId: string,
    dataDoTurno: Date
) {
    try {
        if (await isVigilanteOcupado(vigilanteId, dataDoTurno)) {
            return { success: false, message: "Este vigilante já está escalado neste dia." };
        }

        const turnosCollection = collection(firestore, "turnos");
        // Usando um horário padrão para turnos criados via arrastar e soltar.
        // O ideal seria buscar o horário do template, mas isso adicionaria complexidade
        // a uma ação que precisa ser rápida. Um horário "padrão" é uma boa solução.
        const { inicio, fim } = criarDatasTurno(dataDoTurno, "07:00", "19:00");

        const docRef = await addDoc(turnosCollection, {
            postoId,
            vigilanteId,
            startDateTime: Timestamp.fromDate(inicio),
            endDateTime: Timestamp.fromDate(fim),
            status: "preenchido",
        });

        revalidatePath("/escalas");
        return { success: true, message: "Turno criado e alocado com sucesso.", newTurnoId: docRef.id };
    } catch (error) {
        console.error("Erro ao criar e alocar turno:", error);
        return { success: false, message: "Erro ao criar o turno." };
    }
}
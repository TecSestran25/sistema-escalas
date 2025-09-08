/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/ausencias/actions.ts
"use server";

import { firestore } from "@/lib/firebase";
import { collection, addDoc, Timestamp, doc, getDoc } from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const AusenciaSchema = z.object({
    vigilanteId: z.string().min(1, "É necessário selecionar um vigilante."),
    tipo: z.enum(['ferias', 'atestado', 'falta_justificada', 'outro']),
    dataInicio: z.string().min(10, "Data de início inválida"),
    dataFim: z.string().min(10, "Data de fim inválida"),
    motivo: z.string().optional(),
});

export async function registrarAusencia(prevState: any, formData: FormData) {
    const validatedFields = AusenciaSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { message: "Dados inválidos." };
    }

    const { vigilanteId, tipo, dataInicio: dataInicioStr, dataFim: dataFimStr, motivo } = validatedFields.data;
    const dataInicio = new Date(`${dataInicioStr}T00:00:00`);
    const dataFim = new Date(`${dataFimStr}T00:00:00`);

    if (dataInicio > dataFim) {
        return { message: "A data de início não pode ser posterior à data de fim." };
    }

    try {
        // Para facilitar a visualização, guardamos também o nome do vigilante
        const vigilanteRef = doc(firestore, "vigilantes", vigilanteId);
        const vigilanteSnap = await getDoc(vigilanteRef);
        if (!vigilanteSnap.exists()) {
            return { message: "Vigilante não encontrado." };
        }
        const vigilanteName = vigilanteSnap.data().name;

        await addDoc(collection(firestore, "ausencias"), {
            vigilanteId,
            vigilanteName,
            tipo,
            dataInicio: Timestamp.fromDate(dataInicio),
            dataFim: Timestamp.fromDate(dataFim),
            motivo: motivo || "",
            registadoEm: Timestamp.now(),
        });

        revalidatePath("/ausencias");
        return { success: true, message: "Ausência registada com sucesso!" };

    } catch (error) {
        console.error("Erro ao registar ausência:", error);
        return { message: "Ocorreu um erro no servidor." };
    }
}
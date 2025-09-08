// src/app/(dashboard)/banco-horas/actions.ts
"use server";

import { firestore } from "@/lib/firebase";
import { collection, addDoc, Timestamp, doc, getDoc } from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Esquema de validação para um novo registo no banco de horas
const LancamentoSchema = z.object({
    vigilanteId: z.string().min(1, "É necessário selecionar um vigilante."),
    tipo: z.enum(['credito', 'debito']),
    // coerce.number converte a string do input para número
    minutos: z.coerce.number().min(1, "Os minutos devem ser maiores que zero."),
    motivo: z.string().min(3, "O motivo é obrigatório."),
});

export async function lancarNoBancoDeHoras(prevState: unknown, formData: FormData) {
    const validatedFields = LancamentoSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { success: false, message: "Dados inválidos." };
    }

    const { vigilanteId, tipo, minutos, motivo } = validatedFields.data;

    try {
        const vigilanteRef = doc(firestore, "vigilantes", vigilanteId);
        const vigilanteSnap = await getDoc(vigilanteRef);
        if (!vigilanteSnap.exists()) {
            return { success: false, message: "Vigilante não encontrado." };
        }
        const vigilanteName = vigilanteSnap.data().name;

        const valorEmMinutos = tipo === 'credito' ? minutos : -minutos;

        await addDoc(collection(firestore, "bancoHoras"), {
            vigilanteId,
            vigilanteName,
            tipo,
            minutos: valorEmMinutos,
            motivo,
            dataLancamento: Timestamp.now(),
        });

        revalidatePath("/banco-horas");
        return { success: true, message: "Lançamento registado com sucesso!" };

    } catch (error) {
        console.error("Erro ao lançar no banco de horas:", error);
        return { success: false, message: "Ocorreu um erro no servidor." };
    }
}
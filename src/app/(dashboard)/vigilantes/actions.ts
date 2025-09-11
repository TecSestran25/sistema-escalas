"use server";

import { firestore } from "@/lib/firebase";
import { doc, deleteDoc } from "firebase/firestore";
import { revalidatePath } from "next/cache";

export async function deleteVigilante(vigilanteId: string) {
    try {
        await deleteDoc(doc(firestore, "vigilantes", vigilanteId));
        revalidatePath("/vigilantes");
        return { success: true, message: "Vigilante excluído com sucesso!" };
    } catch (error) {
        console.error("Erro ao excluir vigilante:", error);
        return { success: false, message: "Ocorreu um erro no servidor ao excluir o vigilante." };
    }
}
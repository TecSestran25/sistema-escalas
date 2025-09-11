"use server";

import { firestore } from "@/lib/firebase";
import { doc, deleteDoc } from "firebase/firestore";
import { revalidatePath } from "next/cache";

export async function deletePosto(postoId: string) {
    try {
        await deleteDoc(doc(firestore, "postos", postoId));
        revalidatePath("/postos");
        return { success: true, message: "Posto excluído com sucesso!" };
    } catch (error) {
        console.error("Erro ao excluir posto:", error);
        return { success: false, message: "Ocorreu um erro no servidor ao excluir o posto." };
    }
}
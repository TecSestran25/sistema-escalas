"use server";

import { firestore } from "@/lib/firebase";
import { doc, deleteDoc } from "firebase/firestore";
import { revalidatePath } from "next/cache";

export async function deleteTemplate(templateId: string) {
    try {
        await deleteDoc(doc(firestore, "turnoTemplates", templateId));
        revalidatePath("/templates_escalas");
        return { success: true, message: "Template excluído com sucesso!" };
    } catch (error) {
        console.error("Erro ao excluir template:", error);
        return { success: false, message: "Ocorreu um erro no servidor ao excluir o template." };
    }
}
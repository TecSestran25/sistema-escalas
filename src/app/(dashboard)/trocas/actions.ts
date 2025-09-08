// src/app/(dashboard)/trocas/actions.ts
"use server";

import { firestore } from "@/lib/firebase";
import { doc, runTransaction, updateDoc, collection, addDoc, Timestamp, getDoc } from "firebase/firestore"; // Adicionar collection, addDoc, Timestamp, getDoc
import { revalidatePath } from "next/cache";

export async function solicitarTroca(
    turnoOriginalId: string,
    vigilanteSolicitanteId: string,
    turnoAlvoId: string,
    vigilanteSolicitadoId: string,
) {
    try {
        // Para enriquecer os dados, vamos buscar os nomes
        const vigilanteSolicitanteRef = doc(firestore, "vigilantes", vigilanteSolicitanteId);
        const vigilanteSolicitadoRef = doc(firestore, "vigilantes", vigilanteSolicitadoId);
        const turnoOriginalRef = doc(firestore, "turnos", turnoOriginalId);
        
        const [solicitanteSnap, solicitadoSnap, turnoSnap] = await Promise.all([
            getDoc(vigilanteSolicitanteRef),
            getDoc(vigilanteSolicitadoRef),
            getDoc(turnoOriginalRef),
        ]);

        if (!solicitanteSnap.exists() || !solicitadoSnap.exists() || !turnoSnap.exists()) {
            return { success: false, message: "Dados da solicitação inválidos." };
        }
        
        const postoRef = doc(firestore, "postos", turnoSnap.data().postoId);
        const postoSnap = await getDoc(postoRef);

        await addDoc(collection(firestore, "trocasDeTurno"), {
            // IDs para a action de aprovação
            turnoOriginalId,
            vigilanteSolicitanteId,
            turnoAlvoId,
            vigilanteSolicitadoId,
            // Dados para exibição na lista
            solicitanteNome: solicitanteSnap.data().name,
            solicitadoNome: solicitadoSnap.data().name,
            turnoData: turnoSnap.data().startDateTime,
            turnoPostoNome: postoSnap.exists() ? postoSnap.data().name : "Posto Desconhecido",
            status: "pendente",
            dataSolicitacao: Timestamp.now(),
        });

        revalidatePath("/trocas");
        return { success: true, message: "Pedido de troca enviado com sucesso!" };
    } catch (error) {
        console.error("Erro ao solicitar troca:", error);
        return { success: false, message: "Ocorreu um erro no servidor." };
    }
}


// Action para responder a um pedido de troca (aprovar ou reprovar)
export async function responderTroca(trocaId: string, turnoA_Id: string, vigilanteA_Id: string, turnoB_Id: string, vigilanteB_Id: string, resposta: 'aprovada' | 'reprovada') {
    const trocaRef = doc(firestore, "trocasDeTurno", trocaId);

    try {
        if (resposta === 'aprovada') {
            // Usamos uma transação para garantir que a troca seja atómica
            await runTransaction(firestore, async (transaction) => {
                const turnoA_Ref = doc(firestore, "turnos", turnoA_Id);
                const turnoB_Ref = doc(firestore, "turnos", turnoB_Id);

                // Troca os vigilantes nos dois documentos de turno
                transaction.update(turnoA_Ref, { vigilanteId: vigilanteB_Id });
                transaction.update(turnoB_Ref, { vigilanteId: vigilanteA_Id });

                // Atualiza o estado do pedido de troca
                transaction.update(trocaRef, { status: "aprovada" });
            });
        } else {
            // Se for reprovada, apenas atualizamos o estado do pedido
            await updateDoc(trocaRef, { status: "reprovada" });
        }

        revalidatePath("/trocas");
        revalidatePath("/escalas"); // Revalidar também a página de escalas
        return { success: true, message: `Pedido de troca ${resposta} com sucesso.` };
    } catch (error) {
        console.error("Erro ao responder à troca:", error);
        return { success: false, message: "Ocorreu um erro no servidor." };
    }
}
// src/app/(dashboard)/postos/[id]/editar/page.tsx
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import EditPostoForm from "./EditPostoForm";

// Interface corrigida com o campo "dotação"
interface Posto {
    id: string;
    name: string;
    endereco: string;
    categoria: string;
    dotação: number; // <-- CAMPO ADICIONADO AQUI
    observacoes?: string;
    status: 'ativo' | 'inativo';
}

async function getPosto(id: string): Promise<Posto | null> {
    const docRef = doc(firestore, "postos", id);
    const docSnap = await getDoc(docRef);
    // O cast para "as Posto" agora será correto
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Posto) : null;
}

export default async function EditarPostoPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const posto = await getPosto(id);
    if (!posto) return <div>Posto não encontrado.</div>;
    return (
        <div className="flex justify-center items-center p-8">
            <EditPostoForm posto={posto} />
        </div>
    );
}
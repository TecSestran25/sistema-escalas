// src/app/(dashboard)/postos/[id]/editar/page.tsx
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import EditPostoForm from "./EditPostoForm"; // O formulário de cliente

interface Posto {
    id: string;
    name: string;
    endereco: string;
    categoria: string;
    observacoes?: string;
    status: 'ativo' | 'inativo';
}

async function getPosto(id: string): Promise<Posto | null> {
    const docRef = doc(firestore, "postos", id);
    const docSnap = await getDoc(docRef);
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
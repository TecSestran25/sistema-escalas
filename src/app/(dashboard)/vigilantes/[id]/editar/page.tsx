// src/app/(dashboard)/vigilantes/[id]/editar/page.tsx
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import EditVigilanteForm from "./EditVigilanteForm"; // O formulário que vamos criar a seguir

interface Vigilante {
  id: string;
  name: string;
  matricula: string;
  cpf: string;
  telefone?: string;
  categoria: string;
  status: 'ativo' | 'inativo' | 'ferias' | 'afastado';
}

async function getVigilante(id: string): Promise<Vigilante | null> {
    const docRef = doc(firestore, "vigilantes", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return null;
    }

    return { id: docSnap.id, ...docSnap.data() } as Vigilante;
}

export default async function EditarVigilantePage({ params }: { params: { id: string } }) {
    
    const { id } = await params;

    const vigilante = await getVigilante(id);

    if (!vigilante) {
        return <div>Vigilante não encontrado.</div>;
    }

    return (
        <div className="flex justify-center items-center p-8">
            <EditVigilanteForm vigilante={vigilante} />
        </div>
    );
}
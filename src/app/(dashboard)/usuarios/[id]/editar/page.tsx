// src/app/(dashboard)/usuarios/[id]/editar/page.tsx
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import EditUserForm from "./EditUserForm"; // Vamos criar este formulário a seguir

// Interface para definir a "forma" dos dados do utilizador
interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'supervisor' | 'operator';
    cpf: string;
    isActive: boolean;
    telefone?: string;
}

// Função para ir buscar um único utilizador pelo seu ID
async function getUser(id: string): Promise<User | null> {
    const userDocRef = doc(firestore, "users", id);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        return null; // Utilizador não encontrado
    }

    return { id: userDoc.id, ...userDoc.data() } as User;
}

// A página recebe os parâmetros da URL, incluindo o ID do utilizador
export default async function EditarUsuarioPage({ params }: { params: { id: string } }) {

    const { id } = await params;

    const user = await getUser(id);

    if (!user) {
        return <div>Utilizador não encontrado.</div>;
    }

    return (
        <div className="flex justify-center items-center p-8">
            <EditUserForm user={user} />
        </div>
    );
}
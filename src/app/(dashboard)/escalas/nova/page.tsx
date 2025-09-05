// src/app/(dashboard)/escalas/nova/page.tsx
import { firestore } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import NovaEscalaForm from "./NovaEscalaForm";

// Interface para tipar os dados do usuário
interface User {
  id: string;
  name: string;
}

// Função que busca os usuários no servidor
async function getUsers(): Promise<User[]> {
    const usersCollection = collection(firestore, "users");
    const q = query(usersCollection, orderBy("name", "asc"));
    const querySnapshot = await getDocs(q);

    const users = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name as string, // Pegamos apenas o ID e o nome
    }));

    return users;
}

export default async function NovaEscalaPage() {
  // 1. Buscamos os usuários no servidor
  const users = await getUsers();

  // 2. Renderizamos o componente de formulário, passando os usuários buscados como propriedade
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <NovaEscalaForm users={users} />
    </div>
  );
}
// src/app/(dashboard)/usuarios/page.tsx
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserActions } from "./components/UserActions";

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'supervisor' | 'operator';
  cpf: string;
  isActive: boolean;
  telefone?: string;
}

async function getUsers(): Promise<User[]> {
  const usersCollection = collection(firestore, "users");
  const q = query(usersCollection, orderBy("name", "asc"));
  const querySnapshot = await getDocs(q);

  const users = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<User, 'id'>),
  }));

  return users;
}

export default async function UsuariosPage() {
  const users = await getUsers();

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Usuarios Registados</CardTitle>
          <Button asChild>
            <Link href="/usuarios/nova">Adicionar Usuarios</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.telefone || "N/A"}</TableCell>
                        <TableCell>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {user.isActive ? 'Ativo' : 'Inativo'}
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800`}>
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                        </TableCell>
                        <TableCell className="text-center">
                            <UserActions userId={user.id} />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
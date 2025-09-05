// src/app/(dashboard)/postos/page.tsx
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Interface para os dados do Posto
interface Posto {
  id: string;
  name: string;
  endereco: string;
  categoria: string;
  status: 'ativo' | 'inativo';
}

async function getPostos(): Promise<Posto[]> {
  const postosCollection = collection(firestore, "postos");
  const q = query(postosCollection, orderBy("name", "asc"));
  const querySnapshot = await getDocs(q);

  const postos = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Posto, 'id'>),
  }));

  return postos;
}

export default async function PostosPage() {
  const postos = await getPostos();

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Postos de Vigilância</CardTitle>
          <Button asChild>
            <Link href="/postos/novo">Adicionar Posto</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Posto</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {postos.map((posto) => (
                <TableRow key={posto.id}>
                  <TableCell className="font-medium">{posto.name}</TableCell>
                  <TableCell>{posto.endereco}</TableCell>
                  <TableCell>{posto.categoria}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${posto.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {posto.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/postos/${posto.id}/editar`}>
                        Editar
                      </Link>
                    </Button>
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
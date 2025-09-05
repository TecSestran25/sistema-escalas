// src/app/(dashboard)/vigilantes/page.tsx
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

// Interface para os dados do Vigilante
interface Vigilante {
  id: string;
  name: string;
  matricula: string;
  cpf: string;
  telefone?: string;
  categoria: string;
  status: 'ativo' | 'inativo' | 'ferias' | 'afastado';
}

// Função para buscar os vigilantes no servidor
async function getVigilantes(): Promise<Vigilante[]> {
  const vigilantesCollection = collection(firestore, "vigilantes");
  const q = query(vigilantesCollection, orderBy("name", "asc"));
  const querySnapshot = await getDocs(q);

  const vigilantes = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Vigilante, 'id'>),
  }));

  return vigilantes;
}

export default async function VigilantesPage() {
  const vigilantes = await getVigilantes();

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Vigilantes Registados</CardTitle>
          <Button asChild>
            <Link href="/vigilantes/novo">Adicionar Vigilante</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vigilantes.map((vigilante) => (
                <TableRow key={vigilante.id}>
                  <TableCell className="font-medium">{vigilante.name}</TableCell>
                  <TableCell>{vigilante.matricula}</TableCell>
                  <TableCell>{vigilante.cpf}</TableCell>
                  <TableCell>{vigilante.telefone || "N/A"}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${vigilante.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {vigilante.status.charAt(0).toUpperCase() + vigilante.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      {/* O link para a página de edição que criaremos a seguir */}
                      <Link href={`/vigilantes/${vigilante.id}/editar`}>
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
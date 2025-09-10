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
import { VigilantesView } from "./components/VigilantesView";

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
          <VigilantesView vigilantes={vigilantes} />
        </CardContent>
      </Card>
    </div>
  );
}
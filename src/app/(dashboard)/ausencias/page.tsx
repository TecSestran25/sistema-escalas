// src/app/(dashboard)/ausencias/page.tsx
import { collection, getDocs, orderBy, query, Timestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ptBR } from "date-fns/locale";

interface Ausencia {
    id: string;
    vigilanteName: string;
    tipo: string;
    dataInicio: Timestamp;
    dataFim: Timestamp;
    motivo?: string;
}

async function getAusencias(): Promise<Ausencia[]> {
    const ausenciasCollection = collection(firestore, "ausencias");
    const q = query(ausenciasCollection, orderBy("dataInicio", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ausencia));
}

export default async function AusenciasPage() {
    const ausencias = await getAusencias();

    const formatarTipo = (tipo: string) => {
        switch (tipo) {
            case 'ferias': return 'Férias';
            case 'atestado': return 'Atestado Médico';
            case 'falta_justificada': return 'Falta Justificada';
            default: return 'Outro';
        }
    }

    return (
        <div className="p-4 md:p-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Registos de Ausência</CardTitle>
                    <Button asChild><Link href="/ausencias/novo">Lançar Ausência</Link></Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Vigilante</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Período</TableHead>
                                <TableHead>Motivo</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ausencias.map((ausencia) => (
                                <TableRow key={ausencia.id}>
                                    <TableCell className="font-medium">{ausencia.vigilanteName}</TableCell>
                                    <TableCell>{formatarTipo(ausencia.tipo)}</TableCell>
                                    <TableCell>
                                        {format(ausencia.dataInicio.toDate(), "dd/MM/yyyy")} a {format(ausencia.dataFim.toDate(), "dd/MM/yyyy")}
                                    </TableCell>
                                    <TableCell>{ausencia.motivo}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
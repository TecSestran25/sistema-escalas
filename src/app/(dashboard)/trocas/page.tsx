// src/app/(dashboard)/trocas/page.tsx
import { collection, getDocs, orderBy, query, Timestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowRightLeft } from "lucide-react";
import { BotoesDeAcao } from "./components/BotoesDeAcao"; // Componente de cliente para os botões

// Interface para os dados que esperamos da base de dados
interface Troca {
    id: string;
    solicitanteNome: string;
    solicitadoNome: string;
    turnoData: Timestamp; // Firestore Timestamp
    turnoPostoNome: string;
    status: 'pendente' | 'aprovada' | 'reprovada';
    // IDs necessários para a action
    turnoOriginalId: string;
    vigilanteSolicitanteId: string;
    turnoAlvoId: string;
    vigilanteSolicitadoId: string;
}

async function getPedidosDeTroca(): Promise<Troca[]> {
    const trocasCollection = collection(firestore, "trocasDeTurno");
    const q = query(trocasCollection, orderBy("dataSolicitacao", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Troca));
}

export default async function TrocasPage() {
    const pedidos = await getPedidosDeTroca();

    const getStatusBadge = (status: Troca['status']) => {
        switch (status) {
            case 'aprovada': return 'bg-green-100 text-green-800';
            case 'reprovada': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    }

    return (
        <div className="p-4 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Pedidos de Troca de Turno</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Pedido de Troca</TableHead>
                                <TableHead>Turno</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pedidos.map((pedido) => (
                                <TableRow key={pedido.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <span>{pedido.solicitanteNome}</span>
                                            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                                            <span>{pedido.solicitadoNome}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {pedido.turnoPostoNome} - {format(pedido.turnoData.toDate(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(pedido.status)}`}>
                                            {pedido.status.charAt(0).toUpperCase() + pedido.status.slice(1)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {/* Apenas mostrar botões se o pedido estiver pendente */}
                                        {pedido.status === 'pendente' && (
                                            <BotoesDeAcao pedido={pedido} />
                                        )}
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
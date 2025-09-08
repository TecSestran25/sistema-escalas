// src/app/(dashboard)/banco-horas/components/BancoHorasView.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LancamentoDialog } from "./LancamentoDialog";

interface Vigilante {
    id: string;
    name: string;
    matricula: string;
}

interface VigilanteComSaldo extends Vigilante {
    saldo: number;
}

interface ViewProps {
    vigilantesComSaldo: VigilanteComSaldo[];
    todosVigilantes: Vigilante[];
}

function formatarMinutos(minutos: number) {
    if (minutos === 0) return "0m";
    const sinal = minutos < 0 ? "-" : "";
    const mins = Math.abs(minutos);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${sinal}${h > 0 ? `${h}h ` : ""}${m}m`;
}

export function BancoHorasView({ vigilantesComSaldo, todosVigilantes }: ViewProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <>
            <LancamentoDialog
                isOpen={isDialogOpen}
                setIsOpen={setIsDialogOpen}
                vigilantes={todosVigilantes}
            />
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Banco de Horas</CardTitle>
                    <Button onClick={() => setIsDialogOpen(true)}>Fazer Lançamento</Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Vigilante</TableHead>
                                <TableHead>Matrícula</TableHead>
                                <TableHead className="text-right">Saldo Atual</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vigilantesComSaldo.map((vigilante) => (
                                <TableRow key={vigilante.id}>
                                    <TableCell className="font-medium">{vigilante.name}</TableCell>
                                    <TableCell>{vigilante.matricula}</TableCell>
                                    <TableCell className={`text-right font-semibold ${vigilante.saldo < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {formatarMinutos(vigilante.saldo)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
}
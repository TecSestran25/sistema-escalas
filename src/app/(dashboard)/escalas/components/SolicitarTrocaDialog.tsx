// src/app/(dashboard)/escalas/components/SolicitarTrocaDialog.tsx
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { solicitarTroca } from "../../trocas/actions";

// Interfaces necessárias
interface Turno { id: string; postoId: string; vigilanteId?: string; startDateTime: string; }
interface Vigilante { id: string; name: string; }
interface Posto { id: string; name: string; }

interface DialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    turnoParaTroca: Turno | null;
    todosOsTurnos: Turno[];
    todosOsVigilantes: Vigilante[];
    todosOsPostos: Posto[];
}

export function SolicitarTrocaDialog({ isOpen, setIsOpen, turnoParaTroca, todosOsTurnos, todosOsVigilantes, todosOsPostos }: DialogProps) {
    const [isPending, startTransition] = useTransition();

    if (!turnoParaTroca) return null;

    // Lógica de filtragem para encontrar turnos elegíveis
    const turnosElegiveis = todosOsTurnos.filter(t =>
        t.vigilanteId &&
        t.vigilanteId !== turnoParaTroca.vigilanteId &&
        // Usar isSameDay para uma comparação de data mais robusta
        !isSameDay(new Date(t.startDateTime), new Date(turnoParaTroca.startDateTime))
    );

    const handleSolicitar = (turnoAlvo: Turno) => {
        if (!turnoParaTroca.vigilanteId || !turnoAlvo.vigilanteId) return;
        
        startTransition(async () => {
            const result = await solicitarTroca(
                turnoParaTroca.id,
                turnoParaTroca.vigilanteId!,
                turnoAlvo.id,
                turnoAlvo.vigilanteId!
            );
            alert(result.message);
            if (result.success) {
                setIsOpen(false);
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Solicitar Troca de Turno</DialogTitle>
                    <DialogDescription>
                        A trocar o seu turno de {format(new Date(turnoParaTroca.startDateTime), "dd/MM 'às' HH:mm", { locale: ptBR })}.
                        Selecione um turno abaixo para solicitar a troca.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-96 overflow-y-auto border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Vigilante</TableHead>
                                <TableHead>Posto</TableHead>
                                <TableHead>Data do Turno</TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Se a lista estiver vazia, mostrar a mensagem */}
                            {turnosElegiveis.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                        Nenhum turno elegível para troca encontrado nesta semana.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                turnosElegiveis.map(turno => {
                                    const vigilante = todosOsVigilantes.find(v => v.id === turno.vigilanteId);
                                    const posto = todosOsPostos.find(p => p.id === turno.postoId);
                                    return (
                                        <TableRow key={turno.id}>
                                            <TableCell>{vigilante?.name}</TableCell>
                                            <TableCell>{posto?.name}</TableCell>
                                            <TableCell>{format(new Date(turno.startDateTime), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" onClick={() => handleSolicitar(turno)} disabled={isPending}>
                                                    Solicitar
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    );
}
// src/app/(dashboard)/escalas/components/TurnoCard.tsx
"use client";

import { useDroppable } from "@dnd-kit/core";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Turno {
    id: string;
    postoId: string;
    vigilanteId?: string;
    startDateTime: string;
    endDateTime: string;
}

interface Vigilante {
    id: string;
    name: string;
}

interface TurnoCardProps {
    turno: Turno;
    vigilanteAlocado: Vigilante | undefined; // O vigilante, se houver um alocado
}

export function TurnoCard({ turno, vigilanteAlocado }: TurnoCardProps) {
    const isVago = !vigilanteAlocado;

    // Hook que torna o componente uma zona de largada
    const { isOver, setNodeRef } = useDroppable({
        id: `turno-${turno.id}`, // ID único para a zona de largada
        data: { turno }, // Dados que queremos associar
        disabled: !isVago, // Só pode largar se o turno estiver vago
    });

    return (
        <Card
            ref={setNodeRef}
            className={cn(
                "mb-1 p-2 transition-colors",
                isVago && "border-dashed border-blue-400", // Estilo para turno vago
                isOver && "bg-blue-100" // Estilo quando um vigilante está a ser arrastado por cima
            )}
        >
            <p className="text-xs font-bold">
                {format(new Date(turno.startDateTime), "HH:mm")} - {format(new Date(turno.endDateTime), "HH:mm")}
            </p>
            <div className="text-xs text-muted-foreground mt-1">
                {isVago ? (
                    <span className="italic text-blue-500">Turno Vago</span>
                ) : (
                    <span className="font-semibold text-foreground">{vigilanteAlocado?.name}</span>
                )}
            </div>
        </Card>
    );
}
// src/app/(dashboard)/escalas/components/TurnoCard.tsx
"use client";

import { useDroppable } from "@dnd-kit/core";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { UserX, Repeat } from "lucide-react"; // Importar ícone

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
    isAusente: boolean; // Nova propriedade
    onSolicitarTroca: (turno: Turno) => void;
}

export function TurnoCard({ turno, vigilanteAlocado, isAusente, onSolicitarTroca }: TurnoCardProps) {
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
                "mb-1 p-2 transition-colors relative", // Adicionar 'relative' para o ícone
                isVago && "border-dashed border-blue-400",
                isOver && "bg-blue-100",
                isAusente && "bg-red-100 border-red-400" // Estilo para ausência
            )}
        >
            {/* Ícone de Alerta de Ausência */}
            {isAusente && (
                <div className="absolute top-1 right-1 text-red-600">
                    <UserX className="h-4 w-4" />
                </div>
            )}
            {vigilanteAlocado && !isAusente && (
                <button
                    onClick={() => onSolicitarTroca(turno)}
                    className="absolute bottom-1 right-1 p-1 text-muted-foreground hover:text-primary"
                >
                    <Repeat className="h-3 w-3" />
                </button>
            )}
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
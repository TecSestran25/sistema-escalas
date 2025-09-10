// src/app/(dashboard)/escalas/components/TurnoCard.tsx
"use client";

import { useDroppable } from "@dnd-kit/core";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { UserX, Repeat, MoreVertical, Trash2 } from "lucide-react";

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
    vigilanteAlocado: Vigilante | undefined;
    isAusente: boolean;
    onSolicitarTroca: (turno: Turno) => void;
    onDesalocar: (turnoId: string) => void;
}

export function TurnoCard({ turno, vigilanteAlocado, isAusente, onSolicitarTroca, onDesalocar }: TurnoCardProps) {
    const isVago = !vigilanteAlocado;

    const { isOver, setNodeRef } = useDroppable({
        id: `turno-${turno.id}`,
        data: { turno },
        disabled: !isVago,
    });

    return (
        <Card
            ref={setNodeRef}
            className={cn(
                "mb-1 p-2 transition-colors relative group/turno",
                isVago && "border-dashed border-blue-400",
                isOver && "bg-blue-100",
                isAusente && "bg-red-100 border-red-400"
            )}
        >
            {vigilanteAlocado && (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover/turno:opacity-100">
                             <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                         <DropdownMenuItem onClick={() => onSolicitarTroca(turno)}>
                            <Repeat className="mr-2 h-4 w-4" />
                            <span>Solicitar Troca</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDesalocar(turno.id)} className="text-red-600 focus:text-red-600">
                             <Trash2 className="mr-2 h-4 w-4" />
                             <span>Desalocar</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}

            {isAusente && (
                <div className="absolute bottom-3 right-3 lg:right-2 text-red-600" title="Vigilante com ausência programada">
                    <UserX className="h-4 w-4" />
                </div>
            )}
            
            <p className="text-xs font-bold">
                {format(new Date(turno.startDateTime), "HH:mm")} - {format(new Date(turno.endDateTime), "HH:mm")}
            </p>
            <div className="text-xs text-muted-foreground mt-1">
                {isVago ? (
                    <span className="italic text-blue-500">Turno Vago</span>
                ) : (
                    <span className={cn("font-semibold text-foreground", isAusente && "line-through")}>{vigilanteAlocado?.name}</span>
                )}
            </div>
        </Card>
    );
}
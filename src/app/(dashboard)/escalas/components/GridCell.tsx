// src/app/(dashboard)/escalas/components/GridCell.tsx
"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

interface GridCellProps {
    postoId: string;
    day: Date;
    children: React.ReactNode;
}

export function GridCell({ postoId, day, children }: GridCellProps) {
    // Criamos um ID único para a célula combinando o posto e a data
    const id = `cell-${postoId}-${day.toISOString().split('T')[0]}`;

    const { isOver, setNodeRef } = useDroppable({
        id: id,
        data: {
            postoId,
            day,
        },
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "border bg-background min-h-[100px] p-1 space-y-1 transition-colors",
                isOver && "bg-blue-100" // Feedback visual quando se arrasta por cima
            )}
        >
            {children}
        </div>
    );
}
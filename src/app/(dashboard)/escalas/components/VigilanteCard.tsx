// src/app/(dashboard)/escalas/components/VigilanteCard.tsx
"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";

interface Vigilante {
    id: string;
    name: string;
    matricula: string;
}

interface VigilanteCardProps {
    vigilante: Vigilante;
}

export function VigilanteCard({ vigilante }: VigilanteCardProps) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: vigilante.id,
        data: { vigilante },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="p-3 cursor-grab touch-none"
        >
            <p className="text-sm font-semibold">{vigilante.name}</p>
            <p className="text-xs text-muted-foreground">Matrícula: {vigilante.matricula}</p>
        </Card>
    );
}
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
    // Hook do dnd-kit que torna o componente arrastável
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: vigilante.id, // ID único para o elemento arrastável
        data: { vigilante }, // Dados que queremos passar durante o arrasto
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
            className="p-3 cursor-grab touch-none" // touch-none é importante para o funcionamento em ecrãs táteis
        >
            <p className="text-sm font-semibold">{vigilante.name}</p>
            <p className="text-xs text-muted-foreground">Matrícula: {vigilante.matricula}</p>
        </Card>
    );
}
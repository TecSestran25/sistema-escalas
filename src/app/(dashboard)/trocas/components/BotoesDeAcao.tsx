/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/trocas/components/BotoesDeAcao.tsx
"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { responderTroca } from "../actions";

// Reutilizamos a interface Troca da página principal
interface Troca {
    id: string;
    turnoOriginalId: string;
    vigilanteSolicitanteId: string;
    turnoAlvoId: string;
    vigilanteSolicitadoId: string;
    [key: string]: any; // Permite outras propriedades
}

export function BotoesDeAcao({ pedido }: { pedido: Troca }) {
    const [isPending, startTransition] = useTransition();

    const handleAprovar = () => {
        startTransition(() => {
            responderTroca(pedido.id, pedido.turnoOriginalId, pedido.vigilanteSolicitanteId, pedido.turnoAlvoId, pedido.vigilanteSolicitadoId, 'aprovada');
        });
    };
    
    const handleReprovar = () => {
        startTransition(() => {
            responderTroca(pedido.id, pedido.turnoOriginalId, pedido.vigilanteSolicitanteId, pedido.turnoAlvoId, pedido.vigilanteSolicitadoId, 'reprovada');
        });
    };

    return (
        <div className="space-x-2">
            <Button size="sm" variant="outline" onClick={handleReprovar} disabled={isPending}>
                Reprovar
            </Button>
            <Button size="sm" onClick={handleAprovar} disabled={isPending}>
                Aprovar
            </Button>
        </div>
    );
}
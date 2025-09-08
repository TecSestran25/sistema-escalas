// src/app/(dashboard)/dashboard/components/AlertasDoDia.tsx (sem alterações)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { AlertasData } from "../page";

export function AlertasDoDia({ alertas }: { alertas: AlertasData }) {
    return (
        <Card>
            <CardHeader><CardTitle>Alertas e Eventos do Dia</CardTitle></CardHeader>
            <CardContent>
                <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                        <AlertTriangle className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground">
                            Turnos Vagos Hoje
                        </p>
                        <p className="text-2xl font-bold">
                            {alertas.turnosVagosHoje}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
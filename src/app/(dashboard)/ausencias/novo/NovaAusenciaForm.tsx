// src/app/(dashboard)/ausencias/novo/NovaAusenciaForm.tsx
"use client";

import { useActionState, useTransition } from "react";
import { registrarAusencia } from "../actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface FormProps {
    vigilantes: { id: string; name: string; }[];
}

export function NovaAusenciaForm({ vigilantes }: FormProps) {
    const [state, formAction] = useActionState(registrarAusencia, { message: "" });
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const [dataInicio, setDataInicio] = useState<Date | undefined>();
    const [dataFim, setDataFim] = useState<Date | undefined>();

    useEffect(() => {
        if (state.success) {
            alert(state.message);
            router.push('/ausencias');
        }
    }, [state, router]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        if (dataInicio) formData.set("dataInicio", format(dataInicio, "yyyy-MM-dd"));
        if (dataFim) formData.set("dataFim", format(dataFim, "yyyy-MM-dd"));
        
        startTransition(() => {
            formAction(formData);
        });
    };

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle>Lançar Nova Ausência</CardTitle>
                <CardDescription>Registe um período de ausência para um vigilante.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Vigilante</Label>
                        <Select name="vigilanteId"><SelectTrigger><SelectValue placeholder="Selecione um vigilante" /></SelectTrigger>
                            <SelectContent>{vigilantes.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Tipo de Ausência</Label>
                        <Select name="tipo"><SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ferias">Férias</SelectItem>
                                <SelectItem value="atestado">Atestado Médico</SelectItem>
                                <SelectItem value="falta_justificada">Falta Justificada</SelectItem>
                                <SelectItem value="outro">Outro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                            <Label>Data de Início</Label>
                            <DatePicker date={dataInicio} setDate={setDataInicio} />
                       </div>
                        <div className="space-y-2">
                            <Label>Data de Fim</Label>
                            <DatePicker date={dataFim} setDate={setDataFim} />
                       </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Motivo (Opcional)</Label>
                        <Textarea name="motivo" placeholder="Descreva o motivo da ausência..." />
                    </div>
                    {state?.message && !state.success && <p className="text-sm text-center font-medium text-red-500">{state.message}</p>}
                </CardContent>
                <CardFooter className="flex justify-end gap-4">
                    <Button type="button" variant="outline" asChild><Link href="/ausencias">Cancelar</Link></Button>
                    <Button type="submit" disabled={isPending}>{isPending ? "A Registar..." : "Registar Ausência"}</Button>
                </CardFooter>
            </form>
        </Card>
    );
}
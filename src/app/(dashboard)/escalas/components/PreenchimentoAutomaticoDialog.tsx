// src/app/(dashboard)/escalas/components/PreenchimentoAutomaticoDialog.tsx
"use client";

import { useActionState, useTransition } from "react";
import { preencherEscalaAutomaticamente } from "../actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useState } from "react";
import { format } from "date-fns";

interface DialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    postos: { id: string; name: string; }[];
    templates: { id: string; name: string; }[];
    vigilantes: { id: string; name: string; }[];
}

export function PreenchimentoAutomaticoDialog({ isOpen, setIsOpen, postos, templates, vigilantes }: DialogProps) {
    const [state, formAction] = useActionState(preencherEscalaAutomaticamente, { message: "" });
    const [isPending, startTransition] = useTransition();

    const [dataInicio, setDataInicio] = useState<Date | undefined>();
    const [dataFim, setDataFim] = useState<Date | undefined>();

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
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Preenchimento Automático de Escala</DialogTitle>
                    <DialogDescription>
                        Preencha a escala de um vigilante para um posto e período com base num template.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Vigilante</Label>
                            <Select name="vigilanteId">
                                <SelectTrigger><SelectValue placeholder="Selecione um vigilante" /></SelectTrigger>
                                <SelectContent>
                                    {vigilantes.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label>Posto</Label>
                            <Select name="postoId">
                                <SelectTrigger><SelectValue placeholder="Selecione um posto" /></SelectTrigger>
                                <SelectContent>
                                    {postos.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Template de Ciclo</Label>
                             <Select name="templateId">
                                <SelectTrigger><SelectValue placeholder="Selecione um template" /></SelectTrigger>
                                <SelectContent>
                                    {templates.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                                <Label>Data de Início</Label>
                                <DatePicker date={dataInicio} setDate={setDataInicio} />
                           </div>
                            <div className="space-y-2">
                                <Label>Data de Fim</Label>
                                <DatePicker date={dataFim} setDate={setDataFim} />
                           </div>
                        </div>
                         {state?.message && <p className={`text-sm text-center font-medium ${state.success ? 'text-green-600' : 'text-red-500'}`}>{state.message}</p>}
                    </div>
                     <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "A Preencher..." : "Preencher Escala"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
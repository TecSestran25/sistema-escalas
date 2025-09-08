// src/app/(dashboard)/banco-horas/components/LancamentoDialog.tsx
"use client";

import { useActionState, useTransition, useEffect } from "react";
import { lancarNoBancoDeHoras } from "../actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface DialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    vigilantes: { id: string; name: string; }[];
}

export function LancamentoDialog({ isOpen, setIsOpen, vigilantes }: DialogProps) {
    // Hooks para gerenciar o estado do formulário e a transição
    const [state, formAction] = useActionState(lancarNoBancoDeHoras, { success: false, message: "" });
    const [isPending, startTransition] = useTransition();

    // Efeito para fechar o diálogo e mostrar um alerta em caso de sucesso
    useEffect(() => {
        if (state.success) {
            alert(state.message);
            setIsOpen(false);
        }
    }, [state, setIsOpen]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        // Envolve a chamada da action em startTransition para evitar erros
        startTransition(() => {
            formAction(formData);
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Novo Lançamento no Banco de Horas</DialogTitle>
                    <DialogDescription>
                        Registre um crédito ou débito de horas para um vigilante.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Vigilante</Label>
                            <Select name="vigilanteId">
                                <SelectTrigger><SelectValue placeholder="Selecione um vigilante" /></SelectTrigger>
                                <SelectContent>{vigilantes.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tipo de Lançamento</Label>
                                <Select name="tipo">
                                    <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="credito">Crédito (Horas Extras)</SelectItem>
                                        <SelectItem value="debito">Débito (Compensação)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Minutos</Label>
                                <Input name="minutos" type="number" min="1" placeholder="Ex: 60" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Motivo</Label>
                            <Textarea name="motivo" placeholder="Ex: Cobertura de turno extra no Posto X" required />
                        </div>
                        {state?.message && !state.success && (
                            <p className="text-sm text-center font-medium text-red-500">{state.message}</p>
                        )}
                    </div>
                     <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Lançando..." : "Lançar Registro"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
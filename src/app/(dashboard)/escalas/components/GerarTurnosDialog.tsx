// src/app/(dashboard)/escalas/components/GerarTurnosDialog.tsx
"use client";
import { useState, useTransition  } from "react";
import { useActionState } from "react";
import { gerarTurnos } from "../actions";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker"; // Importar o nosso novo componente

interface Posto { id: string; name: string; }
interface Template { id: string; name: string; }

interface GerarTurnosDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    postos: Posto[];
    templates: Template[];
}

export function GerarTurnosDialog({ isOpen, setIsOpen, postos, templates }: GerarTurnosDialogProps) {
    const [state, formAction] = useActionState(gerarTurnos, { message: "" });

    // Gerir o estado de todos os campos do formulário
    const [postoId, setPostoId] = useState<string | undefined>();
    const [templateId, setTemplateId] = useState<string | undefined>();
    const [dataInicio, setDataInicio] = useState<Date | undefined>();
    const [dataFim, setDataFim] = useState<Date | undefined>();
    // 2. INICIAR O HOOK useTransition
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Criar o FormData manualmente a partir do estado
        const formData = new FormData();
        if (postoId) formData.append("postoId", postoId);
        if (templateId) formData.append("templateId", templateId);
        // Formatar a data para o formato YYYY-MM-DD para o input 'date'
        if (dataInicio) formData.append("dataInicio", format(dataInicio, "yyyy-MM-dd"));
        if (dataFim) formData.append("dataFim", format(dataFim, "yyyy-MM-dd"));

        // 3. ENVOLVER A CHAMADA DA ACTION COM startTransition
        startTransition(() => {
            formAction(formData);
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Gerar Turnos em Massa</DialogTitle>
                    <DialogDescription>
                        Selecione o posto, o template e o período para gerar os turnos vagos.
                    </DialogDescription>
                </DialogHeader>
                {/* O formulário agora chama a nossa função handleSubmit */}
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="postoId">Posto</Label>
                            {/* O 'Select' agora atualiza o nosso estado */}
                            <Select name="postoId" onValueChange={setPostoId} value={postoId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um posto" />
                                </SelectTrigger>
                                <SelectContent>
                                    {postos.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="templateId">Template de Turno</Label>
                             <Select name="templateId" onValueChange={setTemplateId} value={templateId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um template" />
                                </SelectTrigger>
                                <SelectContent>
                                    {templates.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                                <Label htmlFor="dataInicio">Data de Início</Label>
                                {/* Usamos o nosso novo componente DatePicker */}
                                <DatePicker date={dataInicio} setDate={setDataInicio} />
                           </div>
                            <div className="space-y-2">
                                <Label htmlFor="dataFim">Data de Fim</Label>
                                {/* E usamos novamente para a data de fim */}
                                <DatePicker date={dataFim} setDate={setDataFim} />
                           </div>
                        </div>
                         {state?.message && (
                            <p className={`text-sm text-center font-medium ${state.success ? 'text-green-600' : 'text-red-500'}`}>
                                {state.message}
                            </p>
                         )}
                    </div>
                     <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                        <Button type="submit">Gerar Turnos</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// Função para formatação de data, que foi movida para dentro do componente
function format(date: Date, formatStr: string) {
    // Esta é uma implementação simples. A 'date-fns' já está no nosso projeto
    // e poderia ser usada aqui para uma formatação mais robusta se necessário.
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    if (formatStr === 'yyyy-MM-dd') {
        return `${year}-${month}-${day}`;
    }
    return date.toLocaleDateString();
}
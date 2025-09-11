/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/templates_escalas/[id]/editar/EditTemplateForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { z } from "zod";

interface TurnoTemplate {
  id: string;
  name: string;
  type: 'ciclo' | 'fixo';
  horarioInicio: string;
  horarioFim: string;
  config: any;
}

// Reutilizamos os mesmos esquemas de validação da página de criação
const CicloSchema = z.object({
    name: z.string().min(3, "O nome é obrigatório."),
    type: z.literal("ciclo"),
    horarioInicio: z.string().regex(/^\d{2}:\d{2}$/, "Horário inválido."),
    horarioFim: z.string().regex(/^\d{2}:\d{2}$/, "Horário inválido."),
    config: z.object({
        trabalha: z.coerce.number().min(1, "Deve ser no mínimo 1."),
        folga: z.coerce.number().min(1, "Deve ser no mínimo 1."),
    }),
});

const FixoSchema = z.object({
    name: z.string().min(3, "O nome é obrigatório."),
    type: z.literal("fixo"),
    horarioInicio: z.string().regex(/^\d{2}:\d{2}$/, "Horário inválido."),
    horarioFim: z.string().regex(/^\d{2}:\d{2}$/, "Horário inválido."),
    config: z.object({
        dias: z.array(z.string()).min(1, "Selecione pelo menos um dia da semana."),
    }),
});

const TemplateSchema = z.discriminatedUnion("type", [CicloSchema, FixoSchema]);

const diasDaSemana = [
    { id: 'seg', label: 'Seg' }, { id: 'ter', label: 'Ter' },
    { id: 'qua', label: 'Qua' }, { id: 'qui', label: 'Qui' },
    { id: 'sex', label: 'Sex' }, { id: 'sab', label: 'Sáb' },
    { id: 'dom', label: 'Dom' },
];

export default function EditTemplateForm({ template }: { template: TurnoTemplate }) {
    const router = useRouter();
    const [name, setName] = useState(template.name);
    const [type, setType] = useState(template.type);
    const [horarioInicio, setHorarioInicio] = useState(template.horarioInicio || "07:00");
    const [horarioFim, setHorarioFim] = useState(template.horarioFim || "19:00");
    
    // State para config de ciclo
    const [trabalha, setTrabalha] = useState(template.type === 'ciclo' ? template.config.trabalha : 1);
    const [folga, setFolga] = useState(template.type === 'ciclo' ? template.config.folga : 1);
    
    // State para config de dias fixos
    const [diasSelecionados, setDiasSelecionados] = useState<string[]>(template.type === 'fixo' ? template.config.dias : []);

    const [errors, setErrors] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleDiaChange = (diaId: string) => {
        setDiasSelecionados(prev => 
            prev.includes(diaId) ? prev.filter(d => d !== diaId) : [...prev, diaId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        const dataToValidate = type === 'ciclo' ? {
            name, type: 'ciclo' as const, horarioInicio, horarioFim,
            config: { trabalha, folga }
        } : {
            name, type: 'fixo' as const, horarioInicio, horarioFim,
            config: { dias: diasSelecionados }
        };

        const result = TemplateSchema.safeParse(dataToValidate);
        
        if (!result.success) {
            setErrors(result.error.flatten().fieldErrors);
            setIsSubmitting(false);
            return;
        }

        try {
            const templateDocRef = doc(firestore, "turnoTemplates", template.id);
            await updateDoc(templateDocRef, result.data);
            alert("Template atualizado com sucesso!");
            router.push("/templates_escalas");
        } catch (error) {
            console.error("Erro ao atualizar template:", error);
            alert("Ocorreu um erro ao atualizar o template.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex justify-center items-center p-8">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Editar Template de Turno</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                        {/* 1. NOME DO TEMPLATE */}
                        <div className="space-y-2">
                            <Label htmlFor="name">1. Nome do Template</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>

                        {/* 2. TIPO */}
                        <div className="space-y-2">
                            <Label>2. Tipo</Label>
                            <Select onValueChange={(value: "ciclo" | "fixo") => setType(value)} defaultValue={type}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ciclo">Ciclo (trabalho x folga)</SelectItem>
                                    <SelectItem value="fixo">Fixo (dias da semana)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        {/* 3. HORÁRIO */}
                        <div className="space-y-2">
                            <Label>3. Horário do Turno</Label>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="horarioInicio" className="text-xs text-muted-foreground">Horário de Início</Label>
                                    <Input id="horarioInicio" type="time" value={horarioInicio} onChange={(e) => setHorarioInicio(e.target.value)} />
                                     {errors.horarioInicio && <p className="text-sm text-red-500">{errors.horarioInicio}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="horarioFim" className="text-xs text-muted-foreground">Horário de Fim</Label>
                                    <Input id="horarioFim" type="time" value={horarioFim} onChange={(e) => setHorarioFim(e.target.value)} />
                                     {errors.horarioFim && <p className="text-sm text-red-500">{errors.horarioFim}</p>}
                                </div>
                            </div>
                        </div>

                        {/* CAMPOS CONDICIONAIS */}
                        {type === 'ciclo' && (
                            <div className="p-4 border rounded-md bg-muted/50">
                                <p className="text-sm font-medium mb-2">Configure o ciclo de trabalho e folga.</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="trabalha">Dias de Trabalho</Label>
                                        <Input id="trabalha" type="number" value={trabalha} onChange={(e) => setTrabalha(Number(e.target.value))} min="1" />
                                        {errors['config.trabalha'] && <p className="text-sm text-red-500">{errors['config.trabalha']}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="folga">Dias de Folga</Label>
                                        <Input id="folga" type="number" value={folga} onChange={(e) => setFolga(Number(e.target.value))} min="1" />
                                        {errors['config.folga'] && <p className="text-sm text-red-500">{errors['config.folga']}</p>}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {type === 'fixo' && (
                             <div className="p-4 border rounded-md bg-muted/50">
                                <p className="text-sm font-medium mb-4">Marque os dias da semana aplicáveis:</p>
                                <div className="flex flex-wrap gap-4">
                                     {diasDaSemana.map(dia => (
                                        <div key={dia.id} className="flex items-center space-x-2">
                                            <Checkbox 
                                                id={dia.id} 
                                                checked={diasSelecionados.includes(dia.id)}
                                                onCheckedChange={() => handleDiaChange(dia.id)}
                                            />
                                            <Label htmlFor={dia.id} className="font-normal cursor-pointer">{dia.label}</Label>
                                        </div>
                                    ))}
                                </div>
                                {errors['config.dias'] && <p className="text-sm text-red-500 mt-2">{errors['config.dias']}</p>}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-end gap-4">
                        <Button variant="outline" asChild>
                            <Link href="/templates_escalas">Cancelar</Link>
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "A Guardar..." : "Guardar Alterações"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
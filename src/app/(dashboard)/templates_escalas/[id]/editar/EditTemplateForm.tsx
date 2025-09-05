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
import Link from "next/link";
import { z } from "zod";

interface TurnoTemplate {
  id: string;
  name: string;
  type: 'ciclo' | 'semanal';
  config: {
      trabalha: number;
      folga: number;
  };
}

const TemplateSchema = z.object({
    name: z.string().min(3, "O nome é obrigatório."),
    type: z.literal("ciclo"),
    config: z.object({
        trabalha: z.number().min(1, "Deve ser no mínimo 1."),
        folga: z.number().min(1, "Deve ser no mínimo 1."),
    }),
});

export default function EditTemplateForm({ template }: { template: TurnoTemplate }) {
    const router = useRouter();
    const [name, setName] = useState(template.name);
    const [trabalha, setTrabalha] = useState(template.config.trabalha);
    const [folga, setFolga] = useState(template.config.folga);

    const [errors, setErrors] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        const dataToValidate = {
            name,
            type: "ciclo",
            config: {
                trabalha: Number(trabalha),
                folga: Number(folga),
            }
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
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Editar Template de Ciclo</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome do Template</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>
                        <p className="text-sm text-muted-foreground">Configure o ciclo de trabalho e folga.</p>
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
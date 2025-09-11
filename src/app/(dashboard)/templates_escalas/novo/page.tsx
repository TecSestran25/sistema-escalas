/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/templates_escalas/novo/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { z } from "zod";

// O Zod não valida o formulário inteiro, mas sim os dados que vamos guardar
const TemplateSchema = z.object({
    name: z.string().min(3, "O nome é obrigatório."),
    type: z.literal("ciclo"),
    config: z.object({
        trabalha: z.number().min(1, "Deve ser no mínimo 1."),
        folga: z.number().min(1, "Deve ser no mínimo 1."),
    }),
});

export default function NovoTemplatePage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [trabalha, setTrabalha] = useState(1);
    const [folga, setFolga] = useState(1);

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
            await addDoc(collection(firestore, "turnoTemplates"), result.data);
            alert("Template criado com sucesso!");
            router.push("/templates_escalas");
        } catch (error) {
            console.error("Erro ao criar template:", error);
            alert("Ocorreu um erro ao criar o template.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex justify-center items-center p-8">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Criar Novo Template de Ciclo</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome do Template</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: 12x36 (1 dia por 1 dia)" />
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
                            {isSubmitting ? "A Guardar..." : "Guardar Template"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
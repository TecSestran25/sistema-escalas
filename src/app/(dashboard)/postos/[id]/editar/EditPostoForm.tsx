/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/postos/[id]/editar/EditPostoForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { z } from "zod";

interface Posto {
    id: string;
    name: string;
    endereco: string;
    categoria: string;
    dotação: number; // Adicionar o campo
    observacoes?: string;
    status: 'ativo' | 'inativo';
}

const PostoSchema = z.object({
    name: z.string().min(3, "O nome do posto é obrigatório."),
    endereco: z.string().min(5, "O endereço é obrigatório."),
    categoria: z.string().min(3, "A categoria é obrigatória."),
    dotação: z.coerce.number().min(1, "A dotação deve ser no mínimo 1."),
    observacoes: z.string().optional(),
    status: z.enum(['ativo', 'inativo']),
});

export default function EditPostoForm({ posto }: { posto: Posto }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: posto.name,
        endereco: posto.endereco,
        categoria: posto.categoria,
        dotação: posto.dotação || 1,
        observacoes: posto.observacoes || "",
        status: posto.status,
    });
    const [errors, setErrors] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        const result = PostoSchema.safeParse(formData);
        if (!result.success) {
            setErrors(result.error.flatten().fieldErrors);
            setIsSubmitting(false);
            return;
        }

        try {
            const postoDocRef = doc(firestore, "postos", posto.id);
            await updateDoc(postoDocRef, result.data);
            alert("Posto atualizado com sucesso!");
            router.push("/postos");
        } catch (error) {
            console.error("Erro ao atualizar posto:", error);
            alert("Ocorreu um erro ao atualizar o posto.");
            setIsSubmitting(false);
        }
    };

    return (
         <div className="flex justify-center items-center p-8">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Editar Posto</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                       <div className="space-y-2">
                            <Label htmlFor="name">Nome do Posto</Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleChange}/>
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endereco">Endereço</Label>
                            <Input id="endereco" name="endereco" value={formData.endereco} onChange={handleChange}/>
                            {errors.endereco && <p className="text-sm text-red-500">{errors.endereco}</p>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="categoria">Categoria</Label>
                                <Input id="categoria" name="categoria" value={formData.categoria} onChange={handleChange}/>
                                {errors.categoria && <p className="text-sm text-red-500">{errors.categoria}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dotação">Nº de Vigilantes</Label>
                                <Input id="dotação" name="dotação" type="number" min="1" value={formData.dotação} onChange={handleChange}/>
                                {errors.dotação && <p className="text-sm text-red-500">{errors.dotação}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Estado</Label>
                                <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2">
                                    <option value="ativo">Ativo</option>
                                    <option value="inativo">Inativo</option>
                                </select>
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="observacoes">Observações</Label>
                            <Textarea id="observacoes" name="observacoes" value={formData.observacoes} onChange={handleChange}/>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-4">
                        <Button variant="outline" asChild>
                            <Link href="/postos">Cancelar</Link>
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
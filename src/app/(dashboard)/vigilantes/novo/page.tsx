/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/vigilantes/novo/page.tsx
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

// Esquema de validação para os dados do vigilante
const VigilanteSchema = z.object({
    name: z.string().min(3, "O nome é obrigatório."),
    matricula: z.string().min(1, "A matrícula é obrigatória."),
    cpf: z.string().min(11, "O CPF deve ter no mínimo 11 dígitos."),
    telefone: z.string().optional(),
    categoria: z.string().min(3, "A categoria é obrigatória."),
    status: z.enum(['ativo', 'inativo', 'ferias', 'afastado']),
});

export default function NovoVigilantePage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        matricula: "",
        cpf: "",
        telefone: "",
        categoria: "Vigilante Patrimonial",
        status: "ativo",
    });
    const [errors, setErrors] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        const result = VigilanteSchema.safeParse(formData);
        if (!result.success) {
            setErrors(result.error.flatten().fieldErrors);
            setIsSubmitting(false);
            return;
        }

        try {
            await addDoc(collection(firestore, "vigilantes"), result.data);
            alert("Vigilante registado com sucesso!");
            router.push("/vigilantes");
        } catch (error) {
            console.error("Erro ao registar vigilante:", error);
            alert("Ocorreu um erro ao registar o vigilante.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex justify-center items-center p-8">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Registar Novo Vigilante</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                         <div className="space-y-2">
                            <Label htmlFor="name">Nome Completo</Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleChange} />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="matricula">Matrícula</Label>
                                <Input id="matricula" name="matricula" value={formData.matricula} onChange={handleChange} />
                                {errors.matricula && <p className="text-sm text-red-500">{errors.matricula}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cpf">CPF</Label>
                                <Input id="cpf" name="cpf" value={formData.cpf} onChange={handleChange} />
                                {errors.cpf && <p className="text-sm text-red-500">{errors.cpf}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="telefone">Telefone (Opcional)</Label>
                                <Input id="telefone" name="telefone" value={formData.telefone} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="categoria">Categoria</Label>
                                <Input id="categoria" name="categoria" value={formData.categoria} onChange={handleChange} />
                                {errors.categoria && <p className="text-sm text-red-500">{errors.categoria}</p>}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Estado</Label>
                            <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2">
                                <option value="ativo">Ativo</option>
                                <option value="inativo">Inativo</option>
                                <option value="ferias">Férias</option>
                                <option value="afastado">Afastado</option>
                            </select>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-4">
                        <Button variant="outline" asChild>
                            <Link href="/vigilantes">Cancelar</Link>
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "A Guardar..." : "Guardar Vigilante"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
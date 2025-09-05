// src/app/(dashboard)/usuarios/[id]/editar/EditUserForm.tsx
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { z } from "zod";

// Interface para as propriedades que o formulário recebe
interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'supervisor' | 'operator';
    cpf: string;
    isActive: boolean;
    telefone?: string;
}

// Esquema de validação (sem a password, que não vamos alterar aqui)
const UserSchema = z.object({
    name: z.string().min(3, "O nome é obrigatório."),
    email: z.string().email("Por favor, insira um e-mail válido."),
    role: z.enum(['admin', 'supervisor', 'operator']),
    cpf: z.string().min(11, "CPF deve ter no mínimo 11 dígitos."),
    telefone: z.string().optional(),
    isActive: z.boolean(),
});

export default function EditUserForm({ user }: { user: User }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        role: user.role,
        cpf: user.cpf,
        telefone: user.telefone || "",
        isActive: user.isActive,
    });
    const [errors, setErrors] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (checked: boolean) => {
        setFormData(prev => ({ ...prev, isActive: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        const result = UserSchema.safeParse(formData);
        if (!result.success) {
            setErrors(result.error.flatten().fieldErrors);
            setIsSubmitting(false);
            return;
        }

        try {
            const userDocRef = doc(firestore, "users", user.id);
            await updateDoc(userDocRef, result.data); // Usamos updateDoc para atualizar
            alert("Utilizador atualizado com sucesso!");
            router.push("/usuarios");
        } catch (error) {
            console.error("Erro ao atualizar utilizador:", error);
            alert("Ocorreu um erro ao atualizar o utilizador.");
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle>Editar Utilizador</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                    {/* Os campos do formulário são os mesmos da página de criação */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleChange} />
                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} disabled />
                        <p className="text-xs text-gray-500">O e-mail não pode ser alterado.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="cpf">CPF</Label>
                            <Input id="cpf" name="cpf" value={formData.cpf} onChange={handleChange} />
                            {errors.cpf && <p className="text-sm text-red-500">{errors.cpf}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="telefone">Telefone (Opcional)</Label>
                            <Input id="telefone" name="telefone" value={formData.telefone} onChange={handleChange} />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="role">Perfil de Acesso</Label>
                        <select id="role" name="role" value={formData.role} onChange={handleChange} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2">
                            <option value="admin">Administrador</option>
                            <option value="supervisor">Supervisor</option>
                            <option value="operator">Operador</option>
                        </select>
                        {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="isActive" checked={formData.isActive} onCheckedChange={handleSwitchChange} />
                        <Label htmlFor="isActive">Conta Ativa</Label>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-4">
                    <Button variant="outline" asChild>
                        <Link href="/usuarios">Cancelar</Link>
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "A Guardar..." : "Guardar Alterações"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
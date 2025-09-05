// src/app/(dashboard)/usuarios/nova/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"; // Componente para o 'isActive'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { z } from "zod";

// Adicionar o componente Switch do shadcn/ui
// No terminal, rode: npx shadcn-ui@latest add switch

// Validação dos dados do formulário com Zod
const UserSchema = z.object({
    name: z.string().min(3, "O nome é obrigatório."),
    email: z.email("Por favor, insira um e-mail válido."),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
    role: z.enum(['admin', 'supervisor', 'operator'], { message: "Selecione um perfil." }),
    cpf: z.string().min(11, "CPF deve ter no mínimo 11 dígitos."),
    telefone: z.string().optional(),
    isActive: z.boolean(),
});

export default function NovoUsuarioPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "",
        cpf: "",
        telefone: "",
        isActive: true,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            // Por agora, estamos a salvar a password em texto plano.
            // Isto é TEMPORÁRIO e INSEGURO. Vamos mudar para hash em breve.
            await addDoc(collection(firestore, "users"), result.data);
            alert("Utilizador criado com sucesso!");
            router.push("/usuarios");
        } catch (error) {
            console.error("Erro ao criar utilizador:", error);
            alert("Ocorreu um erro ao criar o utilizador.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex justify-center items-center p-8">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Criar Novo Utilizador</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                        {/* Nome, Email, CPF, Telefone... (sem alterações) */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome Completo</Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleChange} />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
                            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="password">Senha Provisória</Label>
                            <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} />
                            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
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
                                <option value="">Selecione...</option>
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
                            {isSubmitting ? "A Guardar..." : "Guardar Utilizador"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
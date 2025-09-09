// src/app/(dashboard)/usuarios/nova/page.tsx
"use client";

import { useActionState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createUser } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";

export default function NovoUsuarioPage() {
    const router = useRouter();
    const [state, formAction, isPending] = useActionState(createUser, { success: false, message: "" });

    useEffect(() => {
        if (state.success) {
            alert(state.message);
            router.push("/usuarios");
        }
    }, [state, router]);

    return (
        <div className="flex justify-center items-center p-8">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Criar Novo Utilizador</CardTitle>
                </CardHeader>
                <form action={formAction}>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome Completo</Label>
                            <Input id="name" name="name" />
                            {state.errors?.name && <p className="text-sm text-red-500">{state.errors.name[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail de Acesso</Label>
                            <Input id="email" name="email" type="email" />
                            {state.errors?.email && <p className="text-sm text-red-500">{state.errors.email[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input id="password" name="password" type="password" />
                            {state.errors?.password && <p className="text-sm text-red-500">{state.errors.password[0]}</p>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="cpf">CPF</Label>
                                <Input id="cpf" name="cpf" />
                                {state.errors?.cpf && <p className="text-sm text-red-500">{state.errors.cpf[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="telefone">Telefone (Opcional)</Label>
                                <Input id="telefone" name="telefone" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Perfil de Acesso</Label>
                            <select id="role" name="role" className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2">
                                <option value="">Selecione...</option>
                                <option value="admin">Administrador</option>
                                <option value="supervisor">Supervisor</option>
                                <option value="operator">Operador</option>
                            </select>
                            {state.errors?.role && <p className="text-sm text-red-500">{state.errors.role[0]}</p>}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="isActive" name="isActive" defaultChecked />
                            <Label htmlFor="isActive">Conta Ativa</Label>
                        </div>
                        {state?.message && !state.success && (
                            <p className="text-sm text-center font-medium text-red-500">{state.message}</p>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-end gap-4">
                        <Button variant="outline" asChild><Link href="/usuarios">Cancelar</Link></Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "A Guardar..." : "Guardar Utilizador"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
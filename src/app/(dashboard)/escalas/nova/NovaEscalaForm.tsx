// src/app/(dashboard)/escalas/nova/NovaEscalaForm.tsx
"use client";

import { useActionState } from "react";
import { createShift, State } from "@/app/(dashboard)/escalas/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";

// 1. Definimos o tipo de dado que esperamos receber para um usuário
interface User {
  id: string;
  name: string;
}

// 2. Definimos as propriedades que nosso componente vai receber
interface NovaEscalaFormProps {
  users: User[];
}

// 3. Recebemos 'users' como uma propriedade
export default function NovaEscalaForm({ users }: NovaEscalaFormProps) {
  const initialState: State = { message: null, errors: {} };
  const [state, dispatch] = useActionState(createShift, initialState);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Criar Nova Escala</CardTitle>
      </CardHeader>
      <form action={dispatch}>
        <CardContent className="space-y-6">
          {/* Campo Título (sem alterações) */}
          <div className="space-y-2">
            <Label htmlFor="title">Título da Escala</Label>
            <Input id="title" name="title" placeholder="Ex: Plantão de Feriado" />
            {state.errors?.title && (
              <p className="text-sm font-medium text-red-500">{state.errors.title}</p>
            )}
          </div>

          {/* Campo Usuário (agora dinâmico) */}
          <div className="space-y-2">
            <Label htmlFor="userId">Atribuir para</Label>
            <select
              id="userId"
              name="userId"
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Selecione um usuário...</option>
              {/* 4. Usamos a lista de usuários recebida para criar as opções */}
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            {state.errors?.userId && (
              <p className="text-sm font-medium text-red-500">{state.errors.userId}</p>
            )}
          </div>

          {/* Campos de data (sem alterações) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="startDateTime">Início da Escala</Label>
              <Input id="startDateTime" name="startDateTime" type="datetime-local" />
              {state.errors?.startDateTime && (
                <p className="text-sm font-medium text-red-500">{state.errors.startDateTime}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDateTime">Fim da Escala</Label>
              <Input id="endDateTime" name="endDateTime" type="datetime-local" />
               {state.errors?.endDateTime && (
                  <p className="text-sm font-medium text-red-500">{state.errors.endDateTime}</p>
              )}
            </div>
          </div>
          {state.message && (
              <p className="text-sm font-medium text-red-500">{state.message}</p>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button variant="outline" asChild>
              <Link href="/escalas">Cancelar</Link>
          </Button>
          <Button type="submit">Salvar Escala</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
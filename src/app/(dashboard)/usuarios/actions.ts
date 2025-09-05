// src/app/(dashboard)/usuarios/actions.ts
"use server";

import { z } from "zod";
import { firestore } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Esquema de validação para o formulário de usuário
const UserSchema = z.object({
  name: z.string().min(3, { message: "O nome é obrigatório." }),
  email: z.email({ message: "Por favor, insira um e-mail válido." }),
  role: z.enum(['admin', 'user'], { message: "Selecione um perfil." }),
  // --- NOVOS CAMPOS ADICIONADOS AQUI ---
  cpf: z.string().min(11, { message: "CPF deve ter no mínimo 11 dígitos." }),
  telefone: z.string().optional(), // Opcional, o usuário não precisa preencher
});

// Tipagem para o estado do formulário (adicionamos os novos campos de erro)
export type UserState = {
  errors?: {
    name?: string[];
    email?: string[];
    role?: string[];
    // --- NOVOS CAMPOS DE ERRO ---
    cpf?: string[];
    telefone?: string[];
  };
  message?: string | null;
};

export async function createUser(prevState: UserState, formData: FormData) {
  const validatedFields = UserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    // --- LENDO OS NOVOS CAMPOS DO FORMDATA ---
    cpf: formData.get("cpf"),
    telefone: formData.get("telefone"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Erro de validação. Corrija os campos.",
    };
  }

  try {
    // Salvando os dados validados (que agora incluem cpf e telefone)
    await addDoc(collection(firestore, "users"), validatedFields.data);
  } catch (e) {
    return {
      message: "Erro no banco de dados: Não foi possível criar o usuário.",
      error: e,
    };
  }

  revalidatePath("/usuarios");
  redirect("/usuarios");
}
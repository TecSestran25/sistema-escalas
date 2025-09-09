// src/app/(dashboard)/usuarios/actions.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { adminAuth, adminFirestore } from "@/lib/firebaseAdmin"; // Usar o Admin SDK

const UserSchema = z.object({
    name: z.string().min(3, "O nome é obrigatório."),
    email: z.string().email("E-mail inválido."),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
    role: z.enum(['admin', 'supervisor', 'operator']),
    cpf: z.string().min(11, "CPF inválido."),
    telefone: z.string().optional(),
    isActive: z.boolean(),
});

// A assinatura da função PRECISA ter o 'prevState' para funcionar com useActionState
export async function createUser(prevState: any, formData: FormData) {
    const isActive = formData.get('isActive') === 'on';
    
    // Usamos Object.fromEntries para converter o FormData num objeto
    const validatedFields = UserSchema.safeParse({
        ...Object.fromEntries(formData.entries()),
        isActive,
    });

    if (!validatedFields.success) {
        // Retornar os erros de forma estruturada
        return { success: false, message: "Dados do formulário inválidos.", errors: validatedFields.error.flatten().fieldErrors };
    }

    const { email, password, name, role, cpf, telefone } = validatedFields.data;

    try {
        // 1. Criar o utilizador no Firebase Authentication
        const userRecord = await adminAuth.createUser({
            email,
            password,
            displayName: name,
            disabled: !isActive,
        });

        // 2. Criar o perfil do utilizador no Firestore
        await adminFirestore.collection("users").doc(userRecord.uid).set({
            name,
            email,
            role,
            cpf,
            telefone: telefone || "",
            isActive,
        });

    } catch (error: any) {
        if (error.code === 'auth/email-already-exists') {
            return { success: false, message: "Este e-mail já está a ser utilizado." };
        }
        console.error("Erro ao criar utilizador:", error);
        return { success: false, message: "Ocorreu um erro no servidor." };
    }

    revalidatePath("/usuarios");
    return { success: true, message: "Utilizador criado com sucesso!" };
}
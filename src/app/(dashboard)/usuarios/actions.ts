/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/usuarios/actions.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { adminAuth, adminFirestore } from "@/lib/firebaseAdmin";

const UserSchema = z.object({
    name: z.string().min(3, "O nome é obrigatório."),
    email: z.string().email("E-mail inválido."),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
    role: z.enum(['admin', 'supervisor', 'operator']),
    cpf: z.string().min(11, "CPF inválido."),
    telefone: z.string().optional(),
    isActive: z.boolean(),
});

export async function createUser(prevState: any, formData: FormData) {
    const isActive = formData.get('isActive') === 'on';
    const validatedFields = UserSchema.safeParse({
        ...Object.fromEntries(formData.entries()),
        isActive,
    });

    if (!validatedFields.success) {
        return { success: false, message: "Dados do formulário inválidos.", errors: validatedFields.error.flatten().fieldErrors };
    }

    const { email, password, name, role, cpf, telefone } = validatedFields.data;

    try {
        const userRecord = await adminAuth.createUser({
            email,
            password,
            displayName: name,
            disabled: !isActive,
        });
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
export async function deleteUser(userId: string) {
    try {
        await adminAuth.deleteUser(userId);
        await adminFirestore.collection("users").doc(userId).delete();
        revalidatePath("/usuarios");
        return { success: true, message: "Usuário excluído com sucesso!" };
    } catch (error) {
        return { success: false, message: `Ocorreu um erro no servidor ao excluir o usuário: ${error}` };
    }
}
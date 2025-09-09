// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // Importar funções do Firestore
import { firestore, app } from "@/lib/firebase"; // Importar firestore e app
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const auth = getAuth(app);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      
      // 1. Autenticar o utilizador no Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Após o sucesso, ir buscar o perfil do utilizador no Firestore
      const userDocRef = doc(firestore, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        // 3. Verificar o papel do utilizador e redirecionar
        if (userData.role === 'operator') {
          router.push("/minha-escala"); // Redirecionar operador para a sua página
        } else {
          router.push("/dashboard"); // Redirecionar admin/supervisor para o dashboard
        }
      } else {
        // Se não encontrar um perfil, envia para uma página padrão por segurança
        setError("Perfil de utilizador não encontrado.");
        await auth.signOut(); // Desloga o utilizador
        setIsSubmitting(false);
      }
    } catch (err) {
      setError("E-mail ou senha inválidos. Tente novamente.");
      console.error("Erro de autenticação:", err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            ShiftManager Pro
          </CardTitle>
          <CardDescription className="text-gray-600">
            Por favor, insira suas credenciais para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* O formulário agora chama nossa função handleLogin */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="********"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div
                className="text-sm font-medium text-red-500 text-center"
                aria-live="polite"
              >
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "A entrar..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
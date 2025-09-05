// src/components/ProtectedRoute.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFirebaseAuth } from "./FirebaseAuthProvider";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. OBTER O 'user' E O NOVO 'loading' DO CONTEXTO
  const { user, loading } = useFirebaseAuth();
  const router = useRouter();

  useEffect(() => {
    // 2. SÓ FAZER A VERIFICAÇÃO DEPOIS QUE O CARREGAMENTO INICIAL TERMINAR
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // 3. ENQUANTO ESTIVER CARREGANDO, MOSTRAR UMA MENSAGEM
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
          <p>A verificar autenticação...</p>
      </div>
    );
  }

  // 4. SE NÃO ESTIVER CARREGANDO E HOUVER UM USUÁRIO, MOSTRAR O CONTEÚDO
  if (user) {
    return <>{children}</>;
  }

  // Se não estiver carregando e não houver usuário, o useEffect já terá redirecionado.
  // Retornar null ou um spinner aqui evita que o conteúdo da página protegida pisque na tela.
  return null;
}
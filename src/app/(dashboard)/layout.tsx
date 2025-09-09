// src/app/(dashboard)/layout.tsx
"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import { useFirebaseAuth } from "@/components/FirebaseAuthProvider"; // Importar o hook
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { getAuth, signOut } from "firebase/auth";
import { app } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Header simplificado para operadores
function OperatorHeader() {
    const router = useRouter();
    const auth = getAuth(app);
    const { userProfile } = useFirebaseAuth();

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/login");
    };

    return (
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-background px-6 sticky top-0 z-10">
            <Link href="/minha-escala">
              <h1 className="text-lg font-bold tracking-tight">ShiftManager</h1>
            </Link>
            <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">{userProfile?.name}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
            </div>
        </header>
    );
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userProfile } = useFirebaseAuth(); // Usar o hook para obter o perfil

  // Se o utilizador for um operador, renderiza um layout mais simples
  if (userProfile && userProfile.role === 'operator') {
    return (
        <ProtectedRoute>
            <div className="flex flex-col min-h-screen">
                <OperatorHeader />
                <main className="flex-1 bg-muted/40">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
  }

  // Caso contrário, renderiza o layout completo com a Sidebar para admins e supervisores
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 md:ml-64 bg-muted/40">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
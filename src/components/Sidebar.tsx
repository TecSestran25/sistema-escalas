// src/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useFirebaseAuth } from "./FirebaseAuthProvider";
import { getAuth, signOut } from "firebase/auth";
import { app } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
  Users, ShieldCheck, Building, Calendar, Settings, LogOut, Sun, Moon, FileText, UserX, Clock, Repeat
} from "lucide-react";

const navLinks = [
  { href: "/escalas", label: "Escalas", icon: Calendar },
  { href: "/postos", label: "Postos", icon: Building },
  { href: "/vigilantes", label: "Vigilantes", icon: ShieldCheck },
  { href: "/usuarios", label: "Utilizadores", icon: Users },
  { href: "/ausencias", label: "Ausências", icon: UserX },
  { href: "/banco-horas", label: "Banco de Horas", icon: Clock },
  { href: "/trocas", label: "Trocas de Turno", icon: Repeat },
  { href: "/templates_escalas", label: "Templates", icon: FileText },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useFirebaseAuth(); // Hook para obter o utilizador logado
  const { setTheme } = useTheme(); // Hook para mudar o tema

  const handleLogout = async () => {
    const auth = getAuth(app);
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Pega as iniciais do nome do utilizador para o Avatar
  const userInitials = user?.displayName?.split(' ').map(n => n[0]).join('') || user?.email?.charAt(0).toUpperCase();

  return (
    <aside className="fixed top-0 left-0 h-full w-64 border-r bg-background z-10 hidden md:flex flex-col">
      {/* Secção Superior com Logo e Navegação */}
      <div className="flex-1">
        <div className="p-4 border-b">
          <Link href="/escalas">
            <h1 className="text-2xl font-bold tracking-tight">ShiftManager</h1>
          </Link>
        </div>
        <nav className="flex flex-col p-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href} passHref>
                <Button variant={isActive ? "secondary" : "ghost"} className="w-full justify-start gap-2">
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Secção Inferior com o Perfil do Utilizador */}
      <div className="p-4 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 h-auto">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.photoURL || undefined} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium leading-none">{user?.displayName || user?.email}</span>
                <span className="text-xs text-muted-foreground">Ver opções</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                    <Sun className="h-4 w-4 mr-2 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 mr-2 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span>Mudar Tema</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => setTheme("light")}>
                            <Sun className="h-4 w-4 mr-2" />
                            Claro
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("dark")}>
                            <Moon className="h-4 w-4 mr-2" />
                            Escuro
                        </DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
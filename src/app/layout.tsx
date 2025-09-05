// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; //
import FirebaseAuthProvider from "@/components/FirebaseAuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider"; // <-- IMPORTAR

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ShiftManager Pro",
  description: "Sistema de Gestão de Escalas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        {/* ENVOLVER TUDO COM O THEMEPROVIDER */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseAuthProvider>
            {children}
          </FirebaseAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
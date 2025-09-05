// src/components/FirebaseAuthProvider.tsx
"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { app } from "@/lib/firebase";

const auth = getAuth(app);

// 1. ATUALIZAR O CONTEXTO PARA INCLUIR O ESTADO DE 'loading'
const AuthContext = createContext<{ user: User | null; loading: boolean }>({
  user: null,
  loading: true, // Começa como 'true'
});

export const useFirebaseAuth = () => useContext(AuthContext);

export default function FirebaseAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // 2. ADICIONAR ESTADO DE 'loading'

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      // 3. APÓS A PRIMEIRA VERIFICAÇÃO, DEFINIR 'loading' COMO 'false'
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 4. PASSAR 'user' E 'loading' PARA O CONTEXTO
  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
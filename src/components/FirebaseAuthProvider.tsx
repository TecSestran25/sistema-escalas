// src/components/FirebaseAuthProvider.tsx
"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { app, firestore } from "@/lib/firebase";

interface UserProfile {
    uid: string;
    name: string;
    email: string;
    role: 'admin' | 'supervisor' | 'operator';
}

const auth = getAuth(app);

// 1. ATUALIZAR O CONTEXTO PARA INCLUIR O ESTADO DE 'loading'
const AuthContext = createContext<{ user: User | null; userProfile: UserProfile | null; loading: boolean }>({
  user: null,
  userProfile: null,
  loading: true,
});

export const useFirebaseAuth = () => useContext(AuthContext);

export default function FirebaseAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // Se houver um utilizador, vamos buscar o seu perfil no Firestore
        const userDocRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            setUserProfile({ uid: user.uid, ...userDoc.data() } as UserProfile);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
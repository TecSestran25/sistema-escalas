// src/app/(dashboard)/minha-escala/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useFirebaseAuth } from "@/components/FirebaseAuthProvider";
import { collection, query, where, getDocs, orderBy, doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Interfaces para os nossos dados
interface Turno {
    id: string;
    postoId: string;
    startDateTime: string;
    endDateTime: string;
}
interface Posto {
    id: string;
    name: string;
}

export default function MinhaEscalaPage() {
    const { user } = useFirebaseAuth(); // Hook para obter o utilizador autenticado
    const [turnos, setTurnos] = useState<Turno[]>([]);
    const [postos, setPostos] = useState<Map<string, string>>(new Map());
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    useEffect(() => {
        async function fetchDados() {
            if (!user) return;

            setLoading(true);

            // 1. Buscar o perfil do utilizador para encontrar o seu vigilanteId
            const userDocRef = doc(firestore, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists() || !userDoc.data().vigilanteId) {
                setLoading(false);
                return;
            }
            const vigilanteId = userDoc.data().vigilanteId;

            // 2. Buscar os turnos associados a esse vigilanteId
            const turnosQuery = query(
                collection(firestore, "turnos"),
                where("vigilanteId", "==", vigilanteId),
                orderBy("startDateTime", "asc")
            );
            const turnosSnapshot = await getDocs(turnosQuery);
            const turnosData = turnosSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Turno));
            setTurnos(turnosData);

            // 3. Buscar os postos para podermos mostrar os nomes
            const postosSnapshot = await getDocs(collection(firestore, "postos"));
            const postosMap = new Map(postosSnapshot.docs.map(doc => [doc.id, doc.data().name]));
            setPostos(postosMap);

            setLoading(false);
        }

        fetchDados();
    }, [user]);

    // Encontrar os turnos do dia selecionado no calendário
    const turnosDoDiaSelecionado = selectedDate ? turnos.filter(turno => 
        format(new Date(turno.startDateTime), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
    ) : [];

    if (loading) {
        return <div className="p-8">A carregar a sua escala...</div>;
    }

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold tracking-tight mb-8">Minha Escala</h1>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border"
                        modifiers={{
                            // Destaca os dias em que o vigilante tem um turno
                            temTurno: turnos.map(t => new Date(t.startDateTime))
                        }}
                        modifiersStyles={{
                            temTurno: {
                                fontWeight: 'bold',
                                color: 'hsl(var(--primary))',
                            }
                        }}
                    />
                </div>
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Turnos para {selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : 'Nenhum dia selecionado'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {turnosDoDiaSelecionado.length > 0 ? (
                                turnosDoDiaSelecionado.map(turno => (
                                    <div key={turno.id} className="p-4 border rounded-md">
                                        <p className="font-semibold">{postos.get(turno.postoId) || "Posto desconhecido"}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(turno.startDateTime), "HH:mm")} - {format(new Date(turno.endDateTime), "HH:mm")}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">Nenhum turno agendado para este dia.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
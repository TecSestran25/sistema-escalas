// src/app/(dashboard)/escalas/page.tsx
import { collection, getDocs, orderBy, query, where, Timestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { EscalaGrid } from "./components/EscalaGrid";
import { startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

// Interfaces para os nossos dados
interface Posto {
  id: string;
  name: string;
  dotação: number; // Adicionar o campo aqui
}
interface Vigilante {
  id: string;
  name: string;
  matricula: string;
  status: string;
}
interface Turno {
    id: string;
    postoId: string;
    vigilanteId?: string;
    startDateTime: Timestamp;
    endDateTime: Timestamp;
}
// Interface para o Template
interface Template {
    id: string;
    name: string;
}

// Função para buscar os postos
async function getPostos(): Promise<Posto[]> {
  const postosCollection = collection(firestore, "postos");
  const q = query(postosCollection, where("status", "==", "ativo"), orderBy("name", "asc"));
  const querySnapshot = await getDocs(q);
  // Garantir que estamos a ir buscar o campo 'dotação'
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Posto));
}

// Função para buscar os vigilantes ativos
async function getVigilantes(): Promise<Vigilante[]> {
  const vigilantesCollection = collection(firestore, "vigilantes");
  const q = query(vigilantesCollection, where("status", "==", "ativo"), orderBy("name", "asc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Vigilante));
}

// Função para buscar os turnos de uma semana específica
async function getTurnos(date: Date): Promise<Turno[]> {
    const start = startOfWeek(date, { locale: ptBR });
    const end = endOfWeek(date, { locale: ptBR });

    const turnosCollection = collection(firestore, "turnos");
    const q = query(turnosCollection,
        where('startDateTime', '>=', Timestamp.fromDate(start)),
        where('startDateTime', '<=', Timestamp.fromDate(end))
    );
    const querySnapshot = await getDocs(q);
    
    // A CORREÇÃO ESTÁ AQUI
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            postoId: data.postoId,
            vigilanteId: data.vigilanteId,
            // Convertemos os Timestamps para strings ISO, que são seguras para serializar
            startDateTime: data.startDateTime.toDate().toISOString(),
            endDateTime: data.endDateTime.toDate().toISOString(),
        };
    });
}

// 1. AQUI ESTÁ A FUNÇÃO QUE FALTAVA
async function getTemplates(): Promise<Template[]> {
    const templatesCollection = collection(firestore, "turnoTemplates");
    const q = query(templatesCollection, orderBy("name", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name } as Template));
}

export default async function EscalasPage() {
  const today = new Date();
  // 2. AGORA O PROMISE.ALL INCLUI A CHAMADA CORRETA PARA getTemplates
  const [postos, vigilantes, turnos, templates] = await Promise.all([
    getPostos(),
    getVigilantes(),
    getTurnos(today),
    getTemplates(),
  ]);

  return (
    <div className="flex flex-col h-full">
      <EscalaGrid
        postos={postos}
        vigilantesIniciais={vigilantes}
        turnosIniciais={JSON.parse(JSON.stringify(turnos))}
        templates={templates} // E os templates são passados como uma propriedade válida
      />
    </div>
  );
}
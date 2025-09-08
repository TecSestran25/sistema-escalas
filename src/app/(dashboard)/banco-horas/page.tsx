// src/app/(dashboard)/banco-horas/page.tsx
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { BancoHorasView } from "./components/BancoHorasView";

interface Vigilante {
    id: string;
    name: string;
    matricula: string;
}

interface Lancamento {
    vigilanteId: string;
    minutos: number;
}

async function getVigilantes(): Promise<Vigilante[]> {
    const q = query(collection(firestore, "vigilantes"), orderBy("name", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vigilante));
}

async function getLancamentos(): Promise<Lancamento[]> {
    const q = query(collection(firestore, "bancoHoras"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Lancamento);
}

export default async function BancoHorasPage() {
    const [vigilantes, lancamentos] = await Promise.all([
        getVigilantes(),
        getLancamentos(),
    ]);

    const saldos = vigilantes.map(vigilante => {
        const saldoTotal = lancamentos
            .filter(l => l.vigilanteId === vigilante.id)
            .reduce((acc, curr) => acc + curr.minutos, 0);
        return {
            ...vigilante,
            saldo: saldoTotal,
        };
    });

    return (
        <div className="p-4 md:p-8">
            <BancoHorasView vigilantesComSaldo={saldos} todosVigilantes={vigilantes} />
        </div>
    );
}
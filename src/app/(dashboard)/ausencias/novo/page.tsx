// src/app/(dashboard)/ausencias/novo/page.tsx
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { NovaAusenciaForm } from "./NovaAusenciaForm"; // Componente de cliente para o formulário

interface Vigilante {
    id: string;
    name: string;
}

async function getVigilantes(): Promise<Vigilante[]> {
    const q = query(
        collection(firestore, "vigilantes"),
        where("status", "==", "ativo"),
        orderBy("name", "asc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
}

export default async function NovaAusenciaPage() {
    const vigilantes = await getVigilantes();

    return (
        <div className="flex justify-center items-center p-8">
            <NovaAusenciaForm vigilantes={vigilantes} />
        </div>
    );
}
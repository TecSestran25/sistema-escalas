/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/dashboard/page.tsx
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { startOfDay, endOfDay } from "date-fns";
import { StatCards } from "./components/StatCards";
import { GraficosView } from "./components/GraficosView";
import { AlertasDoDia } from "./components/AlertasDoDia";

interface Vigilante {
    id: string; // Adicionar ID para cruzamento de dados
    status: 'ativo' | 'inativo' | 'ferias' | 'afastado';
}
interface Turno {
    status: 'vago' | 'preenchido';
    startDateTime: Timestamp;
}
interface Ausencia {
    vigilanteId: string;
    tipo: 'ferias' | 'atestado' | 'falta_justificada' | 'outro';
}
// Tipagem para os dados dos cartões de estatísticas
export interface StatsData {
    totalVigilantes: number;
    ativos: number;
    ferias: number;
    afastados: number;
}

// Tipagem para os dados do gráfico
export interface GraficoData {
    name: string;
    value: number;
}

// Tipagem para os dados dos alertas
export interface AlertasData {
    turnosVagosHoje: number;
}

async function getDashboardData() {
    const hoje = new Date();
    const inicioDoDia = startOfDay(hoje);
    const fimDoDia = endOfDay(hoje);

    const vigilantesPromise = getDocs(collection(firestore, "vigilantes"));
    
    const turnosDeHojeQuery = query(collection(firestore, "turnos"), 
        where("startDateTime", ">=", Timestamp.fromDate(inicioDoDia)),
        where("startDateTime", "<=", Timestamp.fromDate(fimDoDia))
    );
    const turnosDeHojePromise = getDocs(turnosDeHojeQuery);

    // CONSULTA CORRIGIDA PARA VERIFICAR SOBREPOSIÇÃO DE INTERVALOS
    const ausenciasAtivasQuery = query(collection(firestore, "ausencias"),
        // A ausência termina depois do início de hoje E começa antes do fim de hoje
        where("dataFim", ">=", Timestamp.fromDate(inicioDoDia)),
        where("dataInicio", "<=", Timestamp.fromDate(fimDoDia))
    );
    const ausenciasAtivasPromise = getDocs(ausenciasAtivasQuery);

    const [vigilantesSnapshot, turnosSnapshot, ausenciasSnapshot] = await Promise.all([
        vigilantesPromise,
        turnosDeHojePromise,
        ausenciasAtivasPromise,
    ]);

    const vigilantes = vigilantesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vigilante));
    const turnosDeHoje = turnosSnapshot.docs.map(doc => doc.data() as Turno);
    const ausenciasAtivas = ausenciasSnapshot.docs.map(doc => doc.data() as Ausencia);

    return { vigilantes, turnosDeHoje, ausenciasAtivas };
}


// A função de processamento agora recebe as ausências
function processarDados(vigilantes: Vigilante[], turnosDeHoje: Turno[], ausenciasAtivas: Ausencia[]): { stats: StatsData, graficoDistribuicao: any[], alertas: any } {
    
    // 1. Contar as ausências ativas de hoje por tipo
    const feriasHoje = ausenciasAtivas.filter(a => a.tipo === 'ferias').length;
    // Consideramos "afastados" todos os outros tipos de ausência (atestado, etc.)
    const afastadosPorAusencia = ausenciasAtivas.filter(a => a.tipo !== 'ferias').length;

    // 2. Identificar os IDs dos vigilantes que têm uma ausência ATIVA HOJE
    const idsDosVigilantesAusentesHoje = new Set(ausenciasAtivas.map(a => a.vigilanteId));
    
    // 3. Calcular as estatísticas com base nas novas regras
    const totalVigilantes = vigilantes.length;
    
    // Um vigilante está "ativo" para o dashboard se o seu status for 'ativo' E ele não tiver uma ausência registada para hoje.
    const ativos = vigilantes.filter(v => v.status === 'ativo' && !idsDosVigilantesAusentesHoje.has(v.id)).length;
    
    // O total de "em férias" vem da nossa contagem de ausências do tipo 'ferias'.
    const ferias = feriasHoje;

    // O total de "afastados" vem da nossa contagem de ausências que não são férias.
    const afastados = afastadosPorAusencia;
    
    const distribuicaoEfetivo: GraficoData[] = [
        { name: 'ativos', value: ativos },
        { name: 'ferias', value: ferias },
        { name: 'afastados', value: afastados },
        { name: 'inativos', value: totalVigilantes - (ativos + ferias + afastados) },
    ];

    const turnosVagosHoje = turnosDeHoje.filter(t => t.status === 'vago').length;

    return {
        stats: { totalVigilantes, ativos, ferias, afastados },
        graficoDistribuicao: distribuicaoEfetivo,
        alertas: { turnosVagosHoje }
    };
}


export default async function DashboardPage() {
    const { vigilantes, turnosDeHoje, ausenciasAtivas } = await getDashboardData();
    const { stats, graficoDistribuicao, alertas } = processarDados(vigilantes, turnosDeHoje, ausenciasAtivas);

    return (
        <div className="p-4 md:p-8 space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Operacional</h1>
            
            <StatCards stats={stats} />
            
            <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-2">
                    <GraficosView dataDistribuicao={graficoDistribuicao} />
                </div>
                <div>
                    <AlertasDoDia alertas={alertas} />
                </div>
            </div>
        </div>
    );
}
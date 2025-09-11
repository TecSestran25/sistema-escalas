/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/escalas/components/EscalaGrid.tsx
"use client";

import React, { useState, useMemo } from "react"
import { format, startOfMonth, startOfWeek, endOfMonth, eachDayOfInterval, addDays, subDays, isSameDay, isWithinInterval, endOfDay, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay } from "@dnd-kit/core";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, AlertTriangle, ChevronsRight, ChevronsLeft, FileDown } from "lucide-react";
import { GerarTurnosDialog } from "./GerarTurnosDialog";
import { VigilanteCard } from "./VigilanteCard";
import { TurnoCard } from "./TurnoCard";
import { GridCell } from "./GridCell";
import { alocarVigilante, criarEAlocarTurno, desalocarVigilante } from "../actions";
import { PreenchimentoAutomaticoDialog } from "./PreenchimentoAutomaticoDialog";
import { SolicitarTrocaDialog } from "./SolicitarTrocaDialog";

// ... (Interfaces)
interface Posto { id: string; name: string;  dotação: number;}
interface Vigilante { id:string; name: string; matricula: string; telefone?: string; }
interface Turno { id: string; postoId: string; vigilanteId?: string; startDateTime: string; endDateTime: string; }
interface Template { id: string; name: string; }
interface Ausencia {
    vigilanteId: string;
    dataInicio: string;
    dataFim: string;
}
interface EscalaGridProps {
    postos: Posto[];
    vigilantesIniciais: Vigilante[];
    turnosIniciais: Turno[];
    templates: Template[];
    ausenciasIniciais: Ausencia[];
}

const POSTOS_POR_PAGINA = 15;
const VIGILANTES_POR_PAGINA = 15;

export function EscalaGrid({ postos, vigilantesIniciais, turnosIniciais, templates, ausenciasIniciais }: EscalaGridProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isPreenchimentoOpen, setIsPreenchimentoOpen] = useState(false);
    const [activeVigilante, setActiveVigilante] = useState<Vigilante | null>(null);
    const [vigilantes, setVigilantes] = useState(vigilantesIniciais);
    const [turnos, setTurnos] = useState(turnosIniciais);
    const [ausencias, setAusencias] = useState(ausenciasIniciais);
    const [isTrocaDialogOpen, setIsTrocaDialogOpen] = useState(false);
    const [turnoParaTroca, setTurnoParaTroca] = useState<Turno | null>(null);
    const [paginaAtualPostos, setPaginaAtualPostos] = useState(1);
    const [filtroPosto, setFiltroPosto] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [paginaAtualVigilantes, setPaginaAtualVigilantes] = useState(1);
    const [filtroVigilante, setFiltroVigilante] = useState("");

    const startOfTheWeek = startOfWeek(currentDate, { locale: ptBR });
    const daysOfWeek = Array.from({ length: 7 }).map((_, i) => addDays(startOfTheWeek, i));
    const startOfTheMonth = startOfMonth(currentDate);
    const endOfTheMonth = endOfMonth(currentDate);
    const daysOfMonth = eachDayOfInterval({ start: startOfTheMonth, end: endOfTheMonth });


    const handleExportPDF = () => {
        const doc = new jsPDF({ orientation: 'landscape' });
        const monthTitle = `Escala Mensal - ${format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}`;
        doc.text(monthTitle, 14, 15);

        const diasDoMesHeaders = daysOfMonth.map(day => format(day, 'd'));
        const tableHeaders = ['SETOR', 'MATRICULA', 'NOME', 'HORÁRIO', 'FONE', ...diasDoMesHeaders];
        
        const tableBody = postos.flatMap(posto => {
            const turnosDoPosto = turnos.filter(t => t.postoId === posto.id && t.vigilanteId);
            
            const vigilantesDoPosto = turnosDoPosto.reduce((acc, turno) => {
                const vigilante = vigilantes.find(v => v.id === turno.vigilanteId);
                if (!vigilante) return acc;

                const horario = `${format(new Date(turno.startDateTime), "HH:mm")}-${format(new Date(turno.endDateTime), "HH:mm")}`;
                const key = `${vigilante.id}-${horario}`;

                if (!acc[key]) {
                    acc[key] = {
                        ...vigilante,
                        horario,
                        dias: new Array(daysOfMonth.length).fill('')
                    };
                }
                
                const diaIndex = new Date(turno.startDateTime).getDate() - 1;
                acc[key].dias[diaIndex] = 'X';

                return acc;
            }, {} as any);

            const postoRows: any[] = [];
            
            Object.values(vigilantesDoPosto).forEach((vigilante: any, index) => {
                postoRows.push([
                    index === 0 ? posto.name : '',
                    vigilante.matricula,
                    vigilante.name,
                    vigilante.horario,
                    vigilante.telefone || 'N/A',
                    ...vigilante.dias
                ]);
            });

            const vagasOcupadas = Object.keys(vigilantesDoPosto).length;
            const vagasRestantes = posto.dotação - vagasOcupadas;

            for (let i = 0; i < vagasRestantes; i++) {
                postoRows.push([
                    i === 0 && vagasOcupadas === 0 ? posto.name : '',
                    'VAGO', '', '', '', ...new Array(daysOfMonth.length).fill('')
                ]);
            }

            return postoRows;
        });

        autoTable(doc, {
            head: [tableHeaders],
            body: tableBody,
            startY: 20,
            theme: 'grid',
            headStyles: { fontSize: 8, fillColor: [22, 160, 133] },
            styles: { fontSize: 8 },
            columnStyles: {
                0: { cellWidth: 30 },
                2: { cellWidth: 40 },
            }
        });

        doc.save(`escala_${format(currentDate, "yyyy-MM")}.pdf`);
    };

    const handleSolicitarTrocaClick = (turno: Turno) => {
        setTurnoParaTroca(turno);
        setIsTrocaDialogOpen(true);
    };

    const goToPreviousWeek = () => setCurrentDate(subDays(currentDate, 7));
    const goToNextWeek = () => setCurrentDate(addDays(currentDate, 7));

    function handleDragStart(event: DragStartEvent) {
        const vigilanteData = event.active.data.current?.vigilante as Vigilante;
        if (vigilanteData) setActiveVigilante(vigilanteData);
    }

    async function handleDragEnd(event: DragEndEvent) {
        setActiveVigilante(null);
        const { active, over } = event;

        if (!over) return;

        const vigilanteId = active.id as string;
        const targetId = over.id as string;
        
        const dataDoTurnoAlvo = over.data.current?.turno 
            ? new Date((over.data.current.turno as Turno).startDateTime)
            : over.data.current?.day as Date;

        if (!dataDoTurnoAlvo) return; // Segurança extra

        const isAlreadyScheduled = turnos.some(
            t => t.vigilanteId === vigilanteId && isSameDay(new Date(t.startDateTime), dataDoTurnoAlvo)
        );

        if (isAlreadyScheduled) {
            alert("Este vigilante já possui um turno neste dia.");
            return;
        }

        if (targetId.startsWith("turno-")) {
            const turnoId = targetId.replace("turno-", "");
            const estadoOriginalDosTurnos = turnos;

            setTurnos(prev => prev.map(t => t.id === turnoId ? { ...t, vigilanteId } : t));
            
            const result = await alocarVigilante(turnoId, vigilanteId, dataDoTurnoAlvo);
            if (!result.success) {
                alert(result.message);
                setTurnos(estadoOriginalDosTurnos);
            }
        }
        else if (targetId.startsWith("cell-")) {
            const { postoId, day } = over.data.current as { postoId: string, day: Date };
            
            const tempId = `temp-${Date.now()}`;
            const inicioTurno = new Date(day); inicioTurno.setHours(6, 0, 0, 0);
            const fimTurno = new Date(day); fimTurno.setHours(18, 0, 0, 0);

            const newTurno: Turno = {
                id: tempId,
                postoId: postoId,
                vigilanteId: vigilanteId,
                startDateTime: inicioTurno.toISOString(),
                endDateTime: fimTurno.toISOString(),
            };
            
            setTurnos(prev => [...prev, newTurno]);

            const result = await criarEAlocarTurno(postoId, vigilanteId, day);
            
            if (result.success && result.newTurnoId) {
                setTurnos(prev => 
                    prev.map(t => (t.id === tempId ? { ...t, id: result.newTurnoId! } : t))
                );
            } else {
                alert(result.message);
                setTurnos(prev => prev.filter(t => t.id !== tempId));
            }
        }
    }

    async function handleDesalocar(turnoId: string) {
        const estadoOriginalDosTurnos = turnos;
        const turnoParaDesalocar = estadoOriginalDosTurnos.find(t => t.id === turnoId);

        if (!turnoParaDesalocar) return;

        setTurnos(prev => prev.map(t => t.id === turnoId ? { ...t, vigilanteId: undefined, status: "vago" } : t));

        const result = await desalocarVigilante(turnoId);

        if (!result.success) {
            alert(result.message);
            setTurnos(estadoOriginalDosTurnos);
        }
    }

    const postosFiltrados = useMemo(() => 
        postos.filter(posto => 
            posto.name.toLowerCase().includes(filtroPosto.toLowerCase())
        ), [postos, filtroPosto]);

    const totalPaginasPostos = Math.ceil(postosFiltrados.length / POSTOS_POR_PAGINA);
    const postosPaginados = useMemo(() => 
        postosFiltrados.slice((paginaAtualPostos - 1) * POSTOS_POR_PAGINA, paginaAtualPostos * POSTOS_POR_PAGINA),
    [postosFiltrados, paginaAtualPostos]);

    const vigilantesFiltrados = useMemo(() =>
        vigilantes.filter(v =>
            v.name.toLowerCase().includes(filtroVigilante.toLowerCase())
        ), [vigilantes, filtroVigilante]
    );

    const totalPaginasVigilantes = Math.ceil(vigilantesFiltrados.length / VIGILANTES_POR_PAGINA);
    const vigilantesPaginados = useMemo(() =>
        vigilantesFiltrados.slice(
            (paginaAtualVigilantes - 1) * VIGILANTES_POR_PAGINA,
            paginaAtualVigilantes * VIGILANTES_POR_PAGINA
        ),
        [vigilantesFiltrados, paginaAtualVigilantes]
    );

    const turnosPorDia = useMemo(() => {
        const grouped: { [key: string]: Turno[] } = {};
        turnos.forEach(turno => {
            const dateStr = format(new Date(turno.startDateTime), 'yyyy-MM-dd');
            if (!grouped[dateStr]) {
                grouped[dateStr] = [];
            }
            grouped[dateStr].push(turno);
        });
        return grouped;
    }, [turnos]);

    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <GerarTurnosDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} postos={postos} templates={templates} />
            <PreenchimentoAutomaticoDialog 
                isOpen={isPreenchimentoOpen}
                setIsOpen={setIsPreenchimentoOpen}
                postos={postos}
                templates={templates}
                vigilantes={vigilantes}
            />
            <SolicitarTrocaDialog 
                isOpen={isTrocaDialogOpen}
                setIsOpen={setIsTrocaDialogOpen}
                turnoParaTroca={turnoParaTroca}
                todosOsTurnos={turnos}
                todosOsVigilantes={vigilantes}
                todosOsPostos={postos}
            />
            <div className="flex h-full">
                <div className="flex-1 flex flex-col p-4">
                    <header className="flex items-center justify-between mb-4 gap-4 flex-wrap">
                        <h1 className="text-xl font-semibold">
                            Escala da Semana - {format(startOfTheWeek, "dd 'de' MMM", { locale: ptBR })}
                        </h1>
                        <div className="flex items-center gap-2 flex-wrap">
                            <Button onClick={handleExportPDF}><FileDown className="h-4 w-4 mr-2" /> Exportar PDF</Button>
                            <Button onClick={() => setIsDialogOpen(true)}>Gerar Turnos</Button>
                            <Button onClick={() => setIsPreenchimentoOpen(true)}>Preenchimento Automático</Button>
                            <Button variant="outline" size="icon" onClick={goToPreviousWeek}><ChevronLeft className="h-4 w-4" /></Button>
                            <Button variant="outline" onClick={() => setCurrentDate(new Date())}>Hoje</Button>
                            <Button variant="outline" size="icon" onClick={goToNextWeek}><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                    </header>
                    <div className="mb-4">
                        <Input 
                            placeholder="Pesquisar posto..."
                            value={filtroPosto}
                            onChange={(e) => setFiltroPosto(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-[200px_repeat(7,1fr)] gap-1 flex-1">
                        <div className="font-bold bg-muted p-2 rounded-tl-lg">Posto</div>
                        {daysOfWeek.map((day) => (<div key={day.toString()} className="font-bold bg-muted p-2 text-center"><p>{format(day, "eee", { locale: ptBR })}</p><p className="text-sm font-normal">{format(day, "dd/MM")}</p></div>))}
                        
                        {postosPaginados.map((posto) => (
                            <React.Fragment key={posto.id}>
                                <div className="font-semibold bg-muted p-2 flex items-center">{posto.name}</div>
                                {daysOfWeek.map((day) => {
                                    const dayStr = format(day, 'yyyy-MM-dd');
                                    const turnosDoDia = turnosPorDia[dayStr] || [];
                                    const turnosNestePosto = turnosDoDia.filter(t => t.postoId === posto.id);
                                    const pessoalAlocado = turnosNestePosto.filter(t => t.vigilanteId).length;
                                    const necessitaPessoal = pessoalAlocado < posto.dotação;

                                    return (
                                        <GridCell key={`${posto.id}-${day.toString()}`} postoId={posto.id} day={day}>
                                            {necessitaPessoal && (
                                                <div className="flex items-center gap-1 text-xs text-amber-600 mb-1">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    <span>Faltam {posto.dotação - pessoalAlocado}</span>
                                                </div>
                                            )}
                                            {turnosNestePosto.map((turno) => {
                                                const vigilanteAlocado = vigilantes.find(v => v.id === turno.vigilanteId);
                                                const isAusente = vigilanteAlocado ? ausenciasIniciais.some(a => 
                                                    a.vigilanteId === vigilanteAlocado.id &&
                                                    isWithinInterval(new Date(turno.startDateTime), {
                                                        start: new Date(a.dataInicio),
                                                        end: endOfDay(new Date(a.dataFim))
                                                    })
                                                ) : false;

                                                return (
                                                    <TurnoCard 
                                                        key={turno.id} 
                                                        turno={turno} 
                                                        vigilanteAlocado={vigilanteAlocado}
                                                        isAusente={isAusente}
                                                        onSolicitarTroca={handleSolicitarTrocaClick}
                                                        onDesalocar={handleDesalocar}
                                                    />
                                                );
                                            })}
                                        </GridCell>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                     <div className="flex justify-center items-center mt-4 gap-2">
                        <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => setPaginaAtualPostos(prev => Math.max(prev - 1, 1))}
                            disabled={paginaAtualPostos === 1}
                        >
                            Anterior
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Página {paginaAtualPostos} de {totalPaginasPostos}
                        </span>
                        <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => setPaginaAtualPostos(prev => Math.min(prev + 1, totalPaginasPostos))}
                            disabled={paginaAtualPostos === totalPaginasPostos}
                        >
                            Próxima
                        </Button>
                    </div>
                </div>

                {isSidebarOpen && (
                    <aside className="w-64 border-l bg-background p-4 flex flex-col transition-all">
                        <div className="flex justify-between items-center mb-2">
                             <h2 className="text-lg font-semibold">Vigilantes</h2>
                             <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                                 <ChevronsRight className="h-4 w-4" />
                             </Button>
                        </div>
                        <div className="mb-4">
                            <Input
                                placeholder="Pesquisar vigilante..."
                                value={filtroVigilante}
                                onChange={(e) => setFiltroVigilante(e.target.value)}
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2">
                            {vigilantesPaginados.map(v => (<VigilanteCard key={v.id} vigilante={v} />))}
                        </div>
                        <div className="flex justify-center items-center mt-4 gap-2">
                            <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => setPaginaAtualVigilantes(prev => Math.max(prev - 1, 1))}
                                disabled={paginaAtualVigilantes === 1}
                            >
                                Anterior
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                {paginaAtualVigilantes} de {totalPaginasVigilantes}
                            </span>
                            <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => setPaginaAtualVigilantes(prev => Math.min(prev + 1, totalPaginasVigilantes))}
                                disabled={paginaAtualVigilantes === totalPaginasVigilantes}
                            >
                                Próxima
                            </Button>
                        </div>
                    </aside>
                )}
                 {!isSidebarOpen && (
                     <div className="flex items-center justify-center p-2 border-l bg-background">
                         <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
                             <ChevronsLeft className="h-4 w-4" />
                         </Button>
                    </div>
                )}
            </div>
            
            <DragOverlay>
                {activeVigilante ? <VigilanteCard vigilante={activeVigilante} /> : null}
            </DragOverlay>
        </DndContext>
    );
}
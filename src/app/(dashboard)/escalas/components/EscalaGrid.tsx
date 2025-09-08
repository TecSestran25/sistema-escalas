/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/(dashboard)/escalas/components/EscalaGrid.tsx
"use client";

import React, { useState, useMemo } from "react";
import { format, startOfWeek, addDays, subDays, isSameDay, isWithinInterval, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay } from "@dnd-kit/core";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { GerarTurnosDialog } from "./GerarTurnosDialog";
import { VigilanteCard } from "./VigilanteCard";
import { TurnoCard } from "./TurnoCard";
import { GridCell } from "./GridCell";
import { alocarVigilante, criarEAlocarTurno } from "../actions";
import { PreenchimentoAutomaticoDialog } from "./PreenchimentoAutomaticoDialog";
import { SolicitarTrocaDialog } from "./SolicitarTrocaDialog";

// ... (Interfaces)
interface Posto { id: string; name: string;  dotação: number;}
interface Vigilante { id:string; name: string; matricula: string; }
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

    const handleSolicitarTrocaClick = (turno: Turno) => {
        setTurnoParaTroca(turno);
        setIsTrocaDialogOpen(true);
    };

    const startOfTheWeek = startOfWeek(currentDate, { locale: ptBR });
    const daysOfWeek = Array.from({ length: 7 }).map((_, i) => addDays(startOfTheWeek, i));

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

        // Cenário 1: Largou num TurnoCard existente
        if (targetId.startsWith("turno-")) {
            const turnoId = targetId.replace("turno-", "");
            const estadoOriginalDosTurnos = turnos;

            // Atualização Otimista
            setTurnos(prev => prev.map(t => t.id === turnoId ? { ...t, vigilanteId } : t));
            
            const result = await alocarVigilante(turnoId, vigilanteId, dataDoTurnoAlvo);
            if (!result.success) {
                alert(result.message);
                setTurnos(estadoOriginalDosTurnos); // Reverte em caso de erro
            }
        }
        // Cenário 2: Largou numa GridCell vazia
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
            
            // Atualização Otimista
            setTurnos(prev => [...prev, newTurno]);

            const result = await criarEAlocarTurno(postoId, vigilanteId, day);
            
            if (!result.success) {
                alert(result.message);
                setTurnos(prev => prev.filter(t => t.id !== tempId)); // Reverte em caso de erro
            }
            // Se tiver sucesso, o revalidatePath do servidor irá eventualmente substituir o turno temporário
        }
    }

    // Memoizar os turnos por dia para otimizar a renderização
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
                    <header className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-semibold">
                            Escala da Semana - {format(startOfTheWeek, "dd 'de' MMM", { locale: ptBR })}
                        </h1>
                        <div className="flex items-center gap-2">
                            <Button onClick={() => setIsDialogOpen(true)}>Gerar Turnos</Button>
                            <Button onClick={() => setIsPreenchimentoOpen(true)}>Preenchimento Automático</Button>
                            <Button variant="outline" size="icon" onClick={goToPreviousWeek}><ChevronLeft className="h-4 w-4" /></Button>
                            <Button variant="outline" onClick={() => setCurrentDate(new Date())}>Hoje</Button>
                            <Button variant="outline" size="icon" onClick={goToNextWeek}><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                    </header>

                    <div className="grid grid-cols-[200px_repeat(7,1fr)] gap-1 flex-1">
                        <div className="font-bold bg-muted p-2 rounded-tl-lg">Posto</div>
                        {daysOfWeek.map((day) => (<div key={day.toString()} className="font-bold bg-muted p-2 text-center"><p>{format(day, "eee", { locale: ptBR })}</p><p className="text-sm font-normal">{format(day, "dd/MM")}</p></div>))}
                        
                        {postos.map((posto) => (
                            <React.Fragment key={posto.id}>
                                <div className="font-semibold bg-muted p-2 flex items-center">{posto.name}</div>
                                {daysOfWeek.map((day) => {
                                    const dayStr = format(day, 'yyyy-MM-dd');
                                    const turnosDoDia = turnosPorDia[dayStr] || [];
                                    const turnosNestePosto = turnosDoDia.filter(t => t.postoId === posto.id);

                                    // LÓGICA DE VERIFICAÇÃO DE DOTAÇÃO
                                    const pessoalAlocado = turnosNestePosto.filter(t => t.vigilanteId).length;
                                    const necessitaPessoal = pessoalAlocado < posto.dotação;

                                    return (
                                        <GridCell key={`${posto.id}-${day.toString()}`} postoId={posto.id} day={day}>
                                            {/* EXIBIR O ALERTA SE NECESSÁRIO */}
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
                                                    />
                                                );
                                            })}
                                        </GridCell>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <aside className="w-64 border-l bg-background p-4 flex flex-col">
                    <h2 className="text-lg font-semibold mb-4">Vigilantes Disponíveis</h2>
                    <div className="flex-1 overflow-y-auto space-y-2">
                        {vigilantes.map(v => (<VigilanteCard key={v.id} vigilante={v} />))}
                    </div>
                </aside>
            </div>
            
            <DragOverlay>
                {activeVigilante ? <VigilanteCard vigilante={activeVigilante} /> : null}
            </DragOverlay>
        </DndContext>
    );
}
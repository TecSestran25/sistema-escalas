// src/app/(dashboard)/escalas/CalendarView.tsx
"use client";

import { Calendar, dateFnsLocalizer, Event } from "react-big-calendar";
import { format } from "date-fns/format";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";
import { getDay } from "date-fns/getDay";
import { ptBR } from "date-fns/locale/pt-BR"; // Importando o local para Português-Brasil
import "react-big-calendar/lib/css/react-big-calendar.css"; // Estilos padrão
import { Timestamp } from "firebase/firestore";

// Configuração do localizador para o calendário entender datas em pt-BR
const locales = {
  "pt-BR": ptBR,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Definimos o tipo de dado que nossas escalas têm quando vêm do servidor
interface Shift {
  id: string;
  title: string;
  userId: string;
  // Os Timestamps do Firebase precisam ser convertidos
  startDateTime: Timestamp;
  endDateTime: Timestamp;
}

// A propriedade que nosso componente vai receber
interface CalendarViewProps {
  shifts: Shift[];
}

export const CalendarView = ({ shifts }: CalendarViewProps) => {
  // Convertemos nossas escalas para o formato que o react-big-calendar entende
  const events: Event[] = shifts.map((shift) => ({
    title: `${shift.title} (${shift.userId})`, // Ex: "Plantão Loja A (user1)"
    start: shift.startDateTime.toDate(), // .toDate() converte o Timestamp do Firebase para um objeto Date
    end: shift.endDateTime.toDate(),
    resource: { shiftId: shift.id }, // Podemos guardar dados extras aqui
  }));

  return (
    // O componente precisa de um container com altura definida para renderizar corretamente
    <div style={{ height: "calc(100vh - 200px)" }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        culture="pt-BR"
        messages={{
          next: "Próximo",
          today: "Hoje",
          previous: "Anterior",
          month: "Mês",
          week: "Semana",
          day: "Dia",
          agenda: "Agenda",
          date: "Data",
          time: "Hora",
          event: "Evento",
        }}
      />
    </div>
  );
};
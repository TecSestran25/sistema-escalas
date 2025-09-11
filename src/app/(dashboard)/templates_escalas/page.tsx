/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/templates_escalas/page.tsx
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TemplateActions } from "./components/TemplateActions";

// Interface atualizada para o template
interface TurnoTemplate {
  id: string;
  name: string;
  type: 'ciclo' | 'fixo';
  horarioInicio: string;
  horarioFim: string;
  config: any;
}

async function getTemplates(): Promise<TurnoTemplate[]> {
  const templatesCollection = collection(firestore, "turnoTemplates");
  const q = query(templatesCollection, orderBy("name", "asc"));
  const querySnapshot = await getDocs(q);

  const templates = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<TurnoTemplate, 'id'>),
  }));

  return templates;
}

// Função de descrição atualizada para lidar com ambos os tipos e horários
const describeConfig = (template: TurnoTemplate) => {
    const horario = `(${template.horarioInicio || 'N/A'} - ${template.horarioFim || 'N/A'})`;

    if (template.type === 'ciclo' && template.config) {
        return `Ciclo: ${template.config.trabalha} x ${template.config.folga} ${horario}`;
    }

    if (template.type === 'fixo' && template.config?.dias) {
        const diasStr = template.config.dias.join(', ').toUpperCase();
        return `Fixo: ${diasStr} ${horario}`;
    }

    return `Configuração não especificada ${horario}`;
}

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Templates de Turno</CardTitle>
          <Button asChild>
            <Link href="/templates_escalas/novo">Adicionar Template</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Template</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>{template.type === 'ciclo' ? 'Ciclo' : 'Fixo'}</TableCell>
                  <TableCell>{describeConfig(template)}</TableCell>
                  <TableCell className="text-center">
                    <TemplateActions templateId={template.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
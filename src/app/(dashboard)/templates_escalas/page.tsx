/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/templates_escalas/page.tsx
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TemplateActions } from "./components/TemplateActions";

interface TurnoTemplate {
  id: string;
  name: string;
  type: 'ciclo' | 'semanal';
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

const describeConfig = (template: TurnoTemplate) => {
    if (template.type === 'ciclo' && template.config) {
        return `Ciclo: ${template.config.trabalha} dia(s) de trabalho por ${template.config.folga} dia(s) de folga.`;
    }
    // Futuramente, podemos adicionar a descrição para outros tipos de template
    return "Configuração não especificada.";
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
                  <TableCell>{template.type.charAt(0).toUpperCase() + template.type.slice(1)}</TableCell>
                  <TableCell>{describeConfig(template)}</TableCell>
                  <TableCell className="text-center">
                    <Button asChild size="sm">
                      <TemplateActions templateId={template.id} />
                    </Button>
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
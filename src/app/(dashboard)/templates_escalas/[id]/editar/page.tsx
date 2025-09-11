/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/templates_escalas/[id]/editar/page.tsx
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import EditTemplateForm from "./EditTemplateForm";

// Interface atualizada
interface TurnoTemplate {
  id: string;
  name: string;
  type: 'ciclo' | 'fixo';
  horarioInicio: string;
  horarioFim: string;
  config: any;
}

interface EditarTemplatePageProps {
  params: {
    id: string;
  };
}

async function getTemplate(id: string): Promise<TurnoTemplate | null> {
    const docRef = doc(firestore, "turnoTemplates", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return null;
    }

    return { id: docSnap.id, ...docSnap.data() } as TurnoTemplate;
}

export default async function EditarTemplatePage({ params }: EditarTemplatePageProps) {
    const { id } = params;

    const template = await getTemplate(id);

    if (!template) {
        return <div>Template não encontrado.</div>;
    }

    return (
        <div className="flex justify-center items-center p-8">
            <EditTemplateForm template={template} />
        </div>
    );
}
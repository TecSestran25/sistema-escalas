/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/templates_escalas/[id]/editar/page.tsx
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import EditTemplateForm from "./EditTemplateForm";

interface TurnoTemplate {
  id: string;
  name: string;
  type: 'ciclo' | 'semanal';
  config: any;
}

// 1. DEFINIMOS UMA INTERFACE EXPLÍCITA PARA AS PROPRIEDADES DA PÁGINA
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

// 2. USAMOS A NOVA INTERFACE NA ASSINATURA DA FUNÇÃO
export default async function EditarTemplatePage({ params }: EditarTemplatePageProps) {
    const { id } = await params;

    const template = await getTemplate(id);

    if (!template) {
        return <div>Template não encontrado.</div>;
    }

    if (template.type !== 'ciclo') {
        return <div>Este tipo de template ainda não pode ser editado.</div>
    }

    return (
        <div className="flex justify-center items-center p-8">
            <EditTemplateForm template={template} />
        </div>
    );
}
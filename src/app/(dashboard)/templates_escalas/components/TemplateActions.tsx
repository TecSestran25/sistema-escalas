"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { deleteTemplate } from "../actions";
import { Trash2, Edit } from "lucide-react";


interface TemplateActionsProps {
  templateId: string;
}

export function TemplateActions({ templateId }: TemplateActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    await deleteTemplate(templateId);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Excluir Template"
        description="Tem certeza que deseja excluir este template? Esta ação não pode ser desfeita."
      />
      <div className="flex gap-2 justify-center">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/templates_escalas/${templateId}/editar`}>
            <Edit />
          </Link>
        </Button>
        <Button
          className="cursor-pointer"
          variant="ghost"
          size="sm"
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    </>
  );
}
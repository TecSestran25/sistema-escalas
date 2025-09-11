"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { deletePosto } from "../actions";
import { Edit, Trash2 } from "lucide-react";


interface PostoActionsProps {
  postoId: string;
}

export function PostoActions({ postoId }: PostoActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    await deletePosto(postoId);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Excluir Posto"
        description="Tem certeza que deseja excluir este posto? Esta ação não pode ser desfeita."
      />
      <div className="flex gap-2 justify-center">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/postos/${postoId}/editar`}>
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
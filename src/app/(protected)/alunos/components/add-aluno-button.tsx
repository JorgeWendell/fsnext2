"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { pacotesTable } from "@/db/schema";

import UpsertAlunoForm from "./upsert-aluno-form";

interface AddAlunoButtonProps {
  escolas: Array<{
    id: string;
    name: string;
  }>;
  pacotes: Array<typeof pacotesTable.$inferSelect>;
}

const AddAlunoButton = ({ escolas, pacotes }: AddAlunoButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);

    if (!open) {
      setFormKey((currentKey) => currentKey + 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus />
          <span className="hidden sm:inline">Adicionar Aluno</span>
          <span className="sm:hidden">Adicionar</span>
        </Button>
      </DialogTrigger>
      <UpsertAlunoForm
        key={formKey}
        onSuccess={() => setIsOpen(false)}
        escolas={escolas}
        pacotes={pacotes}
      />
    </Dialog>
  );
};

export default AddAlunoButton;

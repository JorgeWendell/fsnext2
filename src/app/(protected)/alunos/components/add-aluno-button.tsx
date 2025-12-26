"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { alunosTable } from "@/db/schema";

import UpsertAlunoForm from "./upsert-aluno-form";

interface AddAlunoButtonProps {
  escolas: Array<{
    id: string;
    name: string;
  }>;
  alunos?: typeof alunosTable.$inferSelect[];
}

const AddAlunoButton = ({ escolas, alunos = [] }: AddAlunoButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Adicionar Aluno
        </Button>
      </DialogTrigger>
      <UpsertAlunoForm 
        onSuccess={() => setIsOpen(false)} 
        escolas={escolas}
        alunos={alunos}
      />
    </Dialog>
  );
};

export default AddAlunoButton;

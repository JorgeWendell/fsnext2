"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import { Plus } from "lucide-react";

import { useState } from "react";
import UpsertAlunoForm from "./upsert-aluno-form";

interface AddAlunoButtonProps {
  escolas: Array<{
    id: string;
    name: string;
  }>;
}

const AddAlunoButton = ({ escolas }: AddAlunoButtonProps) => {
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
      />
    </Dialog>
  );
};

export default AddAlunoButton;

"use client";

/* eslint-disable simple-import-sort/imports */

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
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
        <Button className="w-full sm:w-auto">
          <Plus />
          <span className="hidden sm:inline">Adicionar Aluno</span>
          <span className="sm:hidden">Adicionar</span>
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

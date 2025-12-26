"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { escolasTable } from "@/db/schema";

import UpsertEscolaForm from "./upsert-escola-form";

interface AddEscolaButtonProps {
  representantes: Array<{
    id: string;
    name: string;
  }>;
  escolas?: typeof escolasTable.$inferSelect[];
}

const AddEscolaButton = ({ representantes, escolas = [] }: AddEscolaButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus />
          <span className="hidden sm:inline">Adicionar Escola</span>
          <span className="sm:hidden">Adicionar</span>
        </Button>
      </DialogTrigger>
      <UpsertEscolaForm 
        onSuccess={() => setIsOpen(false)} 
        representantes={representantes}
        escolas={escolas}
      />
    </Dialog>
  );
};

export default AddEscolaButton;

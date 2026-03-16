"use client";

/* eslint-disable simple-import-sort/imports */

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import UpsertEscolaForm from "./upsert-escola-form";

interface AddEscolaButtonProps {
  representantes: Array<{
    id: string;
    name: string;
  }>;
}

const AddEscolaButton = ({ representantes }: AddEscolaButtonProps) => {
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
      />
    </Dialog>
  );
};

export default AddEscolaButton;

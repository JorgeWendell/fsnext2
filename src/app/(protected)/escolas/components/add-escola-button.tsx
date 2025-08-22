"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import { Plus } from "lucide-react";

import { useState } from "react";
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
        <Button>
          <Plus />
          Adicionar Escola
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

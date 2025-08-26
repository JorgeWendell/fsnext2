"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import UpsertRepresentanteForm from "./upsert-repre-form";

const AddRepresentanteButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Adicionar Representante
        </Button>
      </DialogTrigger>
      <UpsertRepresentanteForm onSuccess={() => setIsOpen(false)} />
    </Dialog>
  );
};

export default AddRepresentanteButton;

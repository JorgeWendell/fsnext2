"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import { Plus } from "lucide-react";
import UpsertRepresentanteForm from "./upsert-repre-form";
import { useState } from "react";

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

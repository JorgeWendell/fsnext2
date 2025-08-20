"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Plus } from "lucide-react";
import UpsertRepresentanteForm from "./upsert-repre-form";

const AddRepresentanteButton = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Adicionar Representante
        </Button>
      </DialogTrigger>
      <UpsertRepresentanteForm />
    </Dialog>
  );
};

export default AddRepresentanteButton;

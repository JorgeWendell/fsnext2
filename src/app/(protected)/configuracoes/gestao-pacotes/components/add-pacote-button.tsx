"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import UpsertPacoteDialog from "./upsert-pacote-dialog";

const AddPacoteButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus />
          <span className="hidden sm:inline">Pacote</span>
          <span className="sm:hidden">+ Pacote</span>
        </Button>
      </DialogTrigger>
      <UpsertPacoteDialog isOpen={isOpen} onSuccess={() => setIsOpen(false)} />
    </Dialog>
  );
};

export default AddPacoteButton;


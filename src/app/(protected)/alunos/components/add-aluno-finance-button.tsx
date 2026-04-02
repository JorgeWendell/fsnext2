"use client";

import { DollarSign } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import UpsertAlunoForm from "./upsert-aluno-form";

interface AddAlunoFinanceButtonProps {
  escolas: Array<{
    id: string;
    name: string;
  }>;
}

const AddAlunoFinanceButton = ({ escolas }: AddAlunoFinanceButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <DollarSign />
          Finanças
        </Button>
      </DialogTrigger>
      <UpsertAlunoForm
        dialogOpen={isOpen}
        onSuccess={() => setIsOpen(false)}
        escolas={escolas}
        financeOpenByDefault
      />
    </Dialog>
  );
};

export default AddAlunoFinanceButton;



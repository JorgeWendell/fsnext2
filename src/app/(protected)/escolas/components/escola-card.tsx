"use client";
import { TrashIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteEscola } from "@/actions/delete-escola";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { escolasTable } from "@/db/schema";

import UpsertEscolaForm from "./upsert-escola-form";

type Representante = {
  id: string;
  name: string;
};

interface EscolaCardProps {
  escola: typeof escolasTable.$inferSelect;
  representantes: Representante[];
}

const EscolaCard = ({ escola, representantes }: EscolaCardProps) => {
  const [isUpsertEscolaDialogOpen, setIsUpsertEscolaDialogOpen] =
    useState(false);

  const deleteEscolaAction = useAction(deleteEscola, {
    onSuccess: () => {
      toast.success("Escola excluido com sucesso");
    },
    onError: () => {
      toast.error("Erro ao excluir Escola");
    },
  });

  const handleDeleteEscolaClick = () => {
    if (!escola) return;
    deleteEscolaAction.execute({ id: escola.id });
  };

  const escolaInitials = escola.name
    .split(" ")
    .map((name) => name.charAt(0))
    .join("");

  const formatPhone = (phone: string | null) => {
    if (!phone) return "Não informado";
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 11) {
      return phone;
    }
    const ddd = digits.slice(0, 2);
    const first = digits.slice(2, 7);
    const last = digits.slice(7);
    return `(${ddd}) ${first}-${last}`;
  };

  return (
    <Card className="relative overflow-hidden border-border/50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <CardHeader className="relative">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 ring-2 ring-primary/20 transition-all duration-300 group-hover:ring-primary/40">
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
              {escolaInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium">
              Código: {escola.codigo}
            </p>
            <h3 className="text-sm font-semibold mt-1 truncate">{escola.name}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {formatPhone(escola.phone)}
            </p>
          </div>
        </div>
      </CardHeader>
      <Separator className="relative" />
      <CardFooter className="relative flex flex-col gap-2 pt-4">
        <Dialog
          open={isUpsertEscolaDialogOpen}
          onOpenChange={setIsUpsertEscolaDialogOpen}
        >
          <DialogTrigger asChild>
            <Button className="w-full transition-all duration-200 hover:scale-[1.02]">
              Ver Detalhes
            </Button>
          </DialogTrigger>
          <UpsertEscolaForm
            escola={escola}
            representantes={representantes}
            onSuccess={() => setIsUpsertEscolaDialogOpen(false)}
          />
        </Dialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full transition-all duration-200 hover:scale-[1.02]">
              <TrashIcon />
              Deletar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Tem certeza que quer deletar essa Escola?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Essa ação não pode ser revertida. Isso irá deletar a Escola e
                todos os alunos a ela atribuidas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteEscolaClick}>
                Deletar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};

export default EscolaCard;

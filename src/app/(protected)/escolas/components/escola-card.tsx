"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
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
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { escolasTable } from "@/db/schema";

import { useState } from "react";
import { TrashIcon } from "lucide-react";

import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import UpsertEscolaForm from "./upsert-escola-form";
import { deleteEscola } from "@/actions/delete-escola";

type Representante = {
  id: string;
  name: string;
}

interface EscolaCardProps {
  escola: typeof escolasTable.$inferSelect;
  representantes: Representante[];
}

const EscolaCard = ({ escola, representantes }: EscolaCardProps) => {
  const [isUpsertEscolaDialogOpen, setIsUpsertEscolaDialogOpen] = useState(false);
  
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{escolaInitials}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-medium">{escola.name}</h3>
            <p className="text-sm text-muted-foreground">
              Celular: {escola.phone}
            </p>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardFooter className="flex flex-col gap-2">
        <Dialog
          open={isUpsertEscolaDialogOpen}
          onOpenChange={setIsUpsertEscolaDialogOpen}
        >
          <DialogTrigger asChild>
            <Button className="w-full">Ver Detalhes</Button>
          </DialogTrigger>
          <UpsertEscolaForm
            escola={escola}
            representantes={representantes}
            onSuccess={() => setIsUpsertEscolaDialogOpen(false)}
          />
        </Dialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full">
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

"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
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
import { representantesTable } from "@/db/schema";

import UpsertRepresentanteForm from "./upsert-repre-form";
import { useState } from "react";
import { TrashIcon } from "lucide-react";
import { deleteRepresentante } from "@/actions/delete-representante";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
interface RepresentanteCardProps {
  representante: typeof representantesTable.$inferSelect;
}

const RepresentanteCard = ({ representante }: RepresentanteCardProps) => {
  const [isUpsertRepresentanteDialogOpen, setIsUpsertRepresentanteDialogOpen] =
    useState(false);
  const deleteRepresentanteAction = useAction(deleteRepresentante, {
    onSuccess: () => {
      toast.success("Representante excluido com sucesso");
    },
    onError: () => {
      toast.error("Erro ao excluir Representante");
    },
  });

  const handleDeleteRepresentanteClick = () => {
    if (!representante) return;

    deleteRepresentanteAction.execute({ id: representante.id });
  };
  const representanteInitials = representante.name
    .split(" ")
    .map((name) => name.charAt(0))
    .join("");
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{representanteInitials}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-medium">{representante.name}</h3>
            <p className="text-sm text-muted-foreground">
              {" "}
              Celular:
              {representante.phone}
            </p>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardFooter className="flex flex-col gap-2">
        <Dialog
          open={isUpsertRepresentanteDialogOpen}
          onOpenChange={setIsUpsertRepresentanteDialogOpen}
        >
          <DialogTrigger asChild>
            <Button className="w-full">Ver Detalhes</Button>
          </DialogTrigger>
          <UpsertRepresentanteForm
            representante={representante}
            onSuccess={() => setIsUpsertRepresentanteDialogOpen(false)}
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
                Tem certeza que quer deletar esse Representante?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Essa ação não pode ser revertida. Isso irá deletar o
                Representante e todas as escolas a ele atribuidas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteRepresentanteClick}>
                Deletar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};

export default RepresentanteCard;

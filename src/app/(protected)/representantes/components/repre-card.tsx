"use client";
import { TrashIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteRepresentante } from "@/actions/delete-representante";
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
import { representantesTable } from "@/db/schema";

import UpsertRepresentanteForm from "./upsert-repre-form";
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

  const formatPhone = (phone: string) => {
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
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <CardHeader className="relative">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 ring-2 ring-primary/20 transition-all duration-300 group-hover:ring-primary/40">
            <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-500 text-white font-semibold">
              {representanteInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold truncate">{representante.name}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {formatPhone(representante.phone)}
            </p>
          </div>
        </div>
      </CardHeader>
      <Separator className="relative" />
      <CardFooter className="relative flex flex-col gap-2 pt-4">
        <Dialog
          open={isUpsertRepresentanteDialogOpen}
          onOpenChange={setIsUpsertRepresentanteDialogOpen}
        >
          <DialogTrigger asChild>
            <Button className="w-full transition-all duration-200 hover:scale-[1.02]">
              Ver Detalhes
            </Button>
          </DialogTrigger>
          <UpsertRepresentanteForm
            representante={representante}
            onSuccess={() => setIsUpsertRepresentanteDialogOpen(false)}
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

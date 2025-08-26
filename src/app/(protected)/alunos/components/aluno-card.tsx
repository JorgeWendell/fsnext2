"use client";
import { TrashIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteAluno } from "@/actions/delete-aluno";
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
import { alunosTable } from "@/db/schema";

import UpsertAlunoForm from "./upsert-aluno-form";

type Escola = {
  id: string;
  name: string;
}

interface AlunoCardProps {
  aluno: typeof alunosTable.$inferSelect;
  escolas: Escola[];
}

const AlunoCard = ({ aluno, escolas }: AlunoCardProps) => {
  const [isUpsertAlunoDialogOpen, setIsUpsertAlunoDialogOpen] = useState(false);
  
  const deleteAlunoAction = useAction(deleteAluno, {
    onSuccess: () => {
      toast.success("Aluno excluído com sucesso");
    },
    onError: () => {
      toast.error("Erro ao excluir Aluno");
    },
  });

  const handleDeleteAlunoClick = () => {
    if (!aluno) return;
    deleteAlunoAction.execute({ id: aluno.id });
  };

  const alunoInitials = aluno.name
    .split(" ")
    .map((name) => name.charAt(0))
    .join("");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{alunoInitials}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-medium">{aluno.name}</h3>
            <p className="text-sm text-muted-foreground">
              Classe: {aluno.class}
            </p>
            <p className="text-sm text-muted-foreground">
              Telefone: {aluno.phone}
            </p>
            <div className="flex gap-2 mt-1">
              {(aluno as typeof alunosTable.$inferSelect & { album?: boolean; valor_album?: string })?.album && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Álbum{(aluno as typeof alunosTable.$inferSelect & { album?: boolean; valor_album?: string })?.valor_album && ` - R$ ${parseFloat((aluno as typeof alunosTable.$inferSelect & { album?: boolean; valor_album?: string }).valor_album || '0').toFixed(2).replace('.', ',')}`}
                </span>
              )}
              {(aluno as typeof alunosTable.$inferSelect & { colacao?: boolean; valor_colacao?: string })?.colacao && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Colação{(aluno as typeof alunosTable.$inferSelect & { colacao?: boolean; valor_colacao?: string })?.valor_colacao && ` - R$ ${parseFloat((aluno as typeof alunosTable.$inferSelect & { colacao?: boolean; valor_colacao?: string }).valor_colacao || '0').toFixed(2).replace('.', ',')}`}
                </span>
              )}
              {(aluno as typeof alunosTable.$inferSelect & { baile?: boolean; valor_baile?: string })?.baile && (
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                  Baile{(aluno as typeof alunosTable.$inferSelect & { baile?: boolean; valor_baile?: string })?.valor_baile && ` - R$ ${parseFloat((aluno as typeof alunosTable.$inferSelect & { baile?: boolean; valor_baile?: string }).valor_baile || '0').toFixed(2).replace('.', ',')}`}
                </span>
              )}
              {(aluno as typeof alunosTable.$inferSelect & { convite_extra?: boolean; valor_convite_extra?: string })?.convite_extra && (
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                  Convite Extra{(aluno as typeof alunosTable.$inferSelect & { convite_extra?: boolean; valor_convite_extra?: string })?.valor_convite_extra && ` - R$ ${parseFloat((aluno as typeof alunosTable.$inferSelect & { convite_extra?: boolean; valor_convite_extra?: string }).valor_convite_extra || '0').toFixed(2).replace('.', ',')}`}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardFooter className="flex flex-col gap-2">
        <Dialog
          open={isUpsertAlunoDialogOpen}
          onOpenChange={setIsUpsertAlunoDialogOpen}
        >
          <DialogTrigger asChild>
            <Button className="w-full">Ver Detalhes</Button>
          </DialogTrigger>
          <UpsertAlunoForm
            aluno={aluno}
            escolas={escolas}
            onSuccess={() => setIsUpsertAlunoDialogOpen(false)}
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
                Tem certeza que quer deletar esse Aluno?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Essa ação não pode ser revertida. Isso irá deletar o Aluno e
                todos os dados relacionados a ele.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAlunoClick}>
                Deletar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};

export default AlunoCard;

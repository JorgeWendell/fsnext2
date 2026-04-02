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
};

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
    <Card className="relative overflow-hidden border-border/50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <CardHeader className="relative">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 ring-2 ring-primary/20 transition-all duration-300 group-hover:ring-primary/40">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-semibold">
              {alunoInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium">
              Código: {aluno.codigo}
            </p>
            <h3 className="text-sm font-semibold mt-1 truncate">{aluno.name}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Classe: {aluno.class}
            </p>
            <p className="text-sm text-muted-foreground">
              {aluno.phone}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {(
                aluno as typeof alunosTable.$inferSelect & {
                  album?: boolean;
                  valor_album?: string;
                }
              )?.album && (
                <span className="text-xs bg-blue-500/10 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full font-medium border border-blue-500/20">
                  Álbum
                  {(
                    aluno as typeof alunosTable.$inferSelect & {
                      album?: boolean;
                      valor_album?: string;
                    }
                  )?.valor_album &&
                    ` - R$ ${parseFloat(
                      (
                        aluno as typeof alunosTable.$inferSelect & {
                          album?: boolean;
                          valor_album?: string;
                        }
                      ).valor_album || "0"
                    )
                      .toFixed(2)
                      .replace(".", ",")}`}
                </span>
              )}
              {(
                aluno as typeof alunosTable.$inferSelect & {
                  colacao?: boolean;
                  valor_colacao?: string;
                }
              )?.colacao && (
                <span className="text-xs bg-green-500/10 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full font-medium border border-green-500/20">
                  Colação
                  {(
                    aluno as typeof alunosTable.$inferSelect & {
                      colacao?: boolean;
                      valor_colacao?: string;
                    }
                  )?.valor_colacao &&
                    ` - R$ ${parseFloat(
                      (
                        aluno as typeof alunosTable.$inferSelect & {
                          colacao?: boolean;
                          valor_colacao?: string;
                        }
                      ).valor_colacao || "0"
                    )
                      .toFixed(2)
                      .replace(".", ",")}`}
                </span>
              )}
              {(
                aluno as typeof alunosTable.$inferSelect & {
                  baile?: boolean;
                  valor_baile?: string;
                }
              )?.baile && (
                <span className="text-xs bg-purple-500/10 text-purple-700 dark:text-purple-400 px-2.5 py-1 rounded-full font-medium border border-purple-500/20">
                  Baile
                  {(
                    aluno as typeof alunosTable.$inferSelect & {
                      baile?: boolean;
                      valor_baile?: string;
                    }
                  )?.valor_baile &&
                    ` - R$ ${parseFloat(
                      (
                        aluno as typeof alunosTable.$inferSelect & {
                          baile?: boolean;
                          valor_baile?: string;
                        }
                      ).valor_baile || "0"
                    )
                      .toFixed(2)
                      .replace(".", ",")}`}
                </span>
              )}
              {(
                aluno as typeof alunosTable.$inferSelect & {
                  convite_inteira?: boolean;
                  valor_convite_inteira?: string;
                }
              )?.convite_inteira && (
                <span className="text-xs bg-orange-500/10 text-orange-700 dark:text-orange-400 px-2.5 py-1 rounded-full font-medium border border-orange-500/20">
                  Convite Inteira
                  {(
                    aluno as typeof alunosTable.$inferSelect & {
                      convite_inteira?: boolean;
                      valor_convite_inteira?: string;
                    }
                  )?.valor_convite_inteira &&
                    ` - R$ ${parseFloat(
                      (
                        aluno as typeof alunosTable.$inferSelect & {
                          convite_inteira?: boolean;
                          valor_convite_inteira?: string;
                        }
                      ).valor_convite_inteira || "0"
                    )
                      .toFixed(2)
                      .replace(".", ",")}`}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <Separator className="relative" />
      <CardFooter className="relative flex flex-col gap-2 pt-4">
        <Dialog
          open={isUpsertAlunoDialogOpen}
          onOpenChange={setIsUpsertAlunoDialogOpen}
        >
          <DialogTrigger asChild>
            <Button className="w-full transition-all duration-200 hover:scale-[1.02]">
              Ver Detalhes
            </Button>
          </DialogTrigger>
          <UpsertAlunoForm
            aluno={aluno}
            dialogOpen={isUpsertAlunoDialogOpen}
            escolas={escolas}
            onSuccess={() => setIsUpsertAlunoDialogOpen(false)}
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

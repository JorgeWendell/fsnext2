"use client";
import { Edit, TrashIcon } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { alunosTable } from "@/db/schema";

import UpsertAlunoForm from "./upsert-aluno-form";

type Escola = {
  id: string;
  name: string;
};

interface AlunosTableProps {
  alunos: (typeof alunosTable.$inferSelect)[];
  escolas: Escola[];
}

const AlunosTable = ({ alunos, escolas }: AlunosTableProps) => {
  const [editingAluno, setEditingAluno] = useState<
    typeof alunosTable.$inferSelect | null
  >(null);

  const getEscolaName = (escolaId: string) => {
    const escola = escolas.find((e) => e.id === escolaId);
    return escola?.name || "Escola não encontrada";
  };

  const formatSex = (sex: string) => {
    return sex === "male" ? "Masculino" : "Feminino";
  };

  const deleteAlunoAction = useAction(deleteAluno, {
    onSuccess: () => {
      toast.success("Aluno excluído com sucesso");
    },
    onError: () => {
      toast.error("Erro ao excluir Aluno");
    },
  });

  const handleDeleteAlunoClick = (alunoId: string) => {
    deleteAlunoAction.execute({ id: alunoId });
  };

  const handleEditAluno = (aluno: typeof alunosTable.$inferSelect) => {
    setEditingAluno(aluno);
  };

  const handleCloseEditDialog = () => {
    setEditingAluno(null);
  };

  return (
    <>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle px-4 sm:px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[60px]">Código</TableHead>
                <TableHead className="min-w-[150px]">Nome</TableHead>
                <TableHead className="min-w-[100px] hidden md:table-cell">Classe</TableHead>
                <TableHead className="min-w-[120px] hidden lg:table-cell">Escola</TableHead>
                <TableHead className="min-w-[80px] hidden sm:table-cell">Sexo</TableHead>
                <TableHead className="min-w-[80px] hidden md:table-cell">Álbum</TableHead>
                <TableHead className="min-w-[80px] hidden md:table-cell">Colação</TableHead>
                <TableHead className="min-w-[80px] hidden md:table-cell">Baile</TableHead>
                <TableHead className="min-w-[100px] hidden lg:table-cell">Convite Extra</TableHead>
                <TableHead className="text-right min-w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
        <TableBody>
          {alunos.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={10}
                className="text-center text-muted-foreground"
              >
                Nenhum aluno encontrado
              </TableCell>
            </TableRow>
          ) : (
            alunos.map((aluno) => (
              <TableRow key={aluno.id}>
                <TableCell>{aluno.codigo}</TableCell>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{aluno.name}</span>
                    <span className="text-xs text-muted-foreground md:hidden">
                      {aluno.class} • {formatSex(aluno.sex)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{aluno.class}</TableCell>
                <TableCell className="hidden lg:table-cell">{getEscolaName(aluno.escola)}</TableCell>
                <TableCell className="hidden sm:table-cell">{formatSex(aluno.sex)}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {(
                    aluno as typeof alunosTable.$inferSelect & {
                      album?: boolean;
                      valor_album?: string;
                    }
                  )?.album ? (
                    <div>
                      <div>Sim</div>
                      {(
                        aluno as typeof alunosTable.$inferSelect & {
                          album?: boolean;
                          valor_album?: string;
                        }
                      )?.valor_album && (
                        <div className="text-xs text-muted-foreground">
                          R${" "}
                          {parseFloat(
                            (
                              aluno as typeof alunosTable.$inferSelect & {
                                album?: boolean;
                                valor_album?: string;
                              }
                            ).valor_album || "0"
                          )
                            .toFixed(2)
                            .replace(".", ",")}
                        </div>
                      )}
                    </div>
                  ) : (
                    "Não"
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {(
                    aluno as typeof alunosTable.$inferSelect & {
                      colacao?: boolean;
                      valor_colacao?: string;
                    }
                  )?.colacao ? (
                    <div>
                      <div>Sim</div>
                      {(
                        aluno as typeof alunosTable.$inferSelect & {
                          colacao?: boolean;
                          valor_colacao?: string;
                        }
                      )?.valor_colacao && (
                        <div className="text-xs text-muted-foreground">
                          R${" "}
                          {parseFloat(
                            (
                              aluno as typeof alunosTable.$inferSelect & {
                                colacao?: boolean;
                                valor_colacao?: string;
                              }
                            ).valor_colacao || "0"
                          )
                            .toFixed(2)
                            .replace(".", ",")}
                        </div>
                      )}
                    </div>
                  ) : (
                    "Não"
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {(
                    aluno as typeof alunosTable.$inferSelect & {
                      baile?: boolean;
                      valor_baile?: string;
                    }
                  )?.baile ? (
                    <div>
                      <div>Sim</div>
                      {(
                        aluno as typeof alunosTable.$inferSelect & {
                          baile?: boolean;
                          valor_baile?: string;
                        }
                      )?.valor_baile && (
                        <div className="text-xs text-muted-foreground">
                          R${" "}
                          {parseFloat(
                            (
                              aluno as typeof alunosTable.$inferSelect & {
                                baile?: boolean;
                                valor_baile?: string;
                              }
                            ).valor_baile || "0"
                          )
                            .toFixed(2)
                            .replace(".", ",")}
                        </div>
                      )}
                    </div>
                  ) : (
                    "Não"
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {(
                    aluno as typeof alunosTable.$inferSelect & {
                      convite_extra?: boolean;
                      valor_convite_extra?: string;
                    }
                  )?.convite_extra ? (
                    <div>
                      <div>Sim</div>
                      {(
                        aluno as typeof alunosTable.$inferSelect & {
                          convite_extra?: boolean;
                          valor_convite_extra?: string;
                        }
                      )?.valor_convite_extra && (
                        <div className="text-xs text-muted-foreground">
                          R${" "}
                          {parseFloat(
                            (
                              aluno as typeof alunosTable.$inferSelect & {
                                convite_extra?: boolean;
                                valor_convite_extra?: string;
                              }
                            ).valor_convite_extra || "0"
                          )
                            .toFixed(2)
                            .replace(".", ",")}
                        </div>
                      )}
                    </div>
                  ) : (
                    "Não"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1 sm:gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAluno(aluno)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      {editingAluno && editingAluno.id === aluno.id && (
                        <UpsertAlunoForm
                          aluno={editingAluno}
                          escolas={escolas}
                          onSuccess={handleCloseEditDialog}
                        />
                      )}
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Tem certeza que quer deletar esse Aluno?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Essa ação não pode ser revertida. Isso irá deletar o
                            Aluno e todos os dados relacionados a ele.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteAlunoClick(aluno.id)}
                          >
                            Deletar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default AlunosTable;

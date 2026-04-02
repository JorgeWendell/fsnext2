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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { alunoExtrasTable, alunosTable, pacotesTable } from "@/db/schema";
import { conviteValorTotalString } from "@/lib/convite-valor-total";

import UpsertAlunoForm from "./upsert-aluno-form";

type Escola = {
  id: string;
  name: string;
  pacoteId?: string | null;
};

type Pacote = typeof pacotesTable.$inferSelect;

interface AlunosTableProps {
  alunos: (typeof alunosTable.$inferSelect)[];
  escolas: Escola[];
  extras?: typeof alunoExtrasTable.$inferSelect[];
  pacotes: Pacote[];
}

const AlunosTable = ({
  alunos,
  escolas,
  extras = [],
  pacotes,
}: AlunosTableProps) => {
  const [editingAluno, setEditingAluno] = useState<
    typeof alunosTable.$inferSelect | null
  >(null);
  const getEscolaName = (escolaId: string) => {
    const escola = escolas.find((e) => e.id === escolaId);
    return escola?.name || "Escola não encontrada";
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
                <TableHead className="min-w-[80px] hidden md:table-cell">Álbum</TableHead>
                <TableHead className="min-w-[80px] hidden md:table-cell">Colação</TableHead>
                <TableHead className="min-w-[80px] hidden md:table-cell">Baile</TableHead>
                <TableHead className="min-w-[100px] hidden lg:table-cell">Convite inteira</TableHead>
                <TableHead className="min-w-[100px] hidden lg:table-cell">Convite Meia</TableHead>
                <TableHead className="min-w-[100px] hidden lg:table-cell">Obs</TableHead>
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
            alunos.map((aluno) => {
              const disabled = aluno.active === false;
              return (
                <TableRow
                  key={aluno.id}
                  className={disabled ? "text-red-500" : ""}
                >
                  <TableCell>{aluno.codigo}</TableCell>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{aluno.name}</span>
                      <span className="text-xs text-muted-foreground md:hidden">
                        {aluno.class}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {aluno.class}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {getEscolaName(aluno.escola)}
                  </TableCell>
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
                  {aluno.convite_inteira ? (
                    <div>
                      <div>Sim</div>
                      {aluno.valor_convite_inteira && (
                        <div className="text-xs text-muted-foreground">
                          R${" "}
                          {parseFloat(
                            conviteValorTotalString(
                              aluno.valor_convite_inteira,
                              aluno.qtd_convite_inteira,
                            ),
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
                  {aluno.convite_meia ? (
                    <div>
                      <div>Sim</div>
                      {aluno.valor_convite_meia && (
                        <div className="text-xs text-muted-foreground">
                          R${" "}
                          {parseFloat(
                            conviteValorTotalString(
                              aluno.valor_convite_meia,
                              aluno.qtd_convite_meia,
                            ),
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
                  {extras.some(
                    (extra) =>
                      extra.alunoId === aluno.id && extra.paid === true,
                  ) && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Ver
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Itens extras pagos</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2 text-sm">
                          {extras
                            .filter(
                              (extra) =>
                                extra.alunoId === aluno.id &&
                                extra.paid === true,
                            )
                            .map((extra) => (
                              <div
                                key={extra.id}
                                className="flex items-center justify-between rounded border px-3 py-2"
                              >
                                <div className="flex flex-col">
                                  <span>
                                    {extra.type === "album"
                                      ? "Álbum"
                                      : extra.type === "convite_extra"
                                        ? "Convite extra"
                                        : extra.type}
                                  </span>
                                  {extra.quantity && (
                                    <span className="text-xs text-muted-foreground">
                                      Qtd: {extra.quantity}
                                    </span>
                                  )}
                                </div>
                                <span className="font-semibold">
                                  R{" "}
                                  {parseFloat(extra.total || "0")
                                    .toFixed(2)
                                    .replace(".", ",")}
                                </span>
                              </div>
                            ))}
                        </div>
                      </DialogContent>
                    </Dialog>
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
                            disabled={disabled}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        {editingAluno && editingAluno.id === aluno.id && (
                          <UpsertAlunoForm
                            aluno={editingAluno}
                            escolas={escolas}
                            pacotes={pacotes}
                            onSuccess={handleCloseEditDialog}
                          />
                        )}
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={disabled}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Tem certeza que quer deletar esse Aluno?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Essa ação não pode ser revertida. Isso irá deletar
                              o Aluno e todos os dados relacionados a ele.
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
              );
            })
          )}
        </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default AlunosTable;

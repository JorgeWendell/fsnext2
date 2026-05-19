"use client";

import { Edit, MoreHorizontal, TrashIcon } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { escolasTable, pacotesTable } from "@/db/schema";

import UpsertEscolaForm from "./upsert-escola-form";

type Representante = {
  id: string;
  name: string;
};

type Pacote = typeof pacotesTable.$inferSelect;

interface EscolasTableProps {
  escolas: (typeof escolasTable.$inferSelect)[];
  representantes: Representante[];
  pacotes: Pacote[];
}

function formatPhone(phone: string | null) {
  if (!phone) return "-";
  const digits = phone.replace(/\D/g, "");
  if (digits.length !== 11) return phone;
  const ddd = digits.slice(0, 2);
  const first = digits.slice(2, 7);
  const last = digits.slice(7);
  return `(${ddd}) ${first}-${last}`;
}

function formatCodigoAno(codigo: string, ano: string | null) {
  const anoSuffix = ano ? ano.slice(-2) : "";
  return `${codigo}/${anoSuffix}`;
}

const EscolasTable = ({
  escolas,
  representantes,
  pacotes,
}: EscolasTableProps) => {
  const [editingEscola, setEditingEscola] = useState<
    typeof escolasTable.$inferSelect | null
  >(null);
  const [deletingEscola, setDeletingEscola] = useState<
    typeof escolasTable.$inferSelect | null
  >(null);

  const getRepresentanteName = (representanteId: string | null) => {
    if (!representanteId) return "-";
    const representante = representantes.find((item) => item.id === representanteId);
    return representante?.name ?? "-";
  };

  const deleteEscolaAction = useAction(deleteEscola, {
    onSuccess: () => {
      toast.success("Escola excluída com sucesso");
      setDeletingEscola(null);
    },
    onError: () => {
      toast.error("Erro ao excluir escola");
    },
  });

  const handleDeleteEscola = () => {
    if (!deletingEscola) return;
    deleteEscolaAction.execute({ id: deletingEscola.id });
  };

  return (
    <>
      <div className="-mx-4 overflow-x-auto sm:mx-0">
        <div className="inline-block min-w-full align-middle px-4 sm:px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Nome</TableHead>
                <TableHead className="min-w-[100px]">Código/Ano</TableHead>
                <TableHead className="min-w-[130px] hidden sm:table-cell">
                  Telefone
                </TableHead>
                <TableHead className="min-w-[150px] hidden md:table-cell">
                  Representante
                </TableHead>
                <TableHead className="min-w-[80px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {escolas.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    Nenhuma escola encontrada
                  </TableCell>
                </TableRow>
              ) : (
                escolas.map((escola) => (
                  <TableRow key={escola.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{escola.name}</span>
                        <span className="text-xs text-muted-foreground sm:hidden">
                          {formatCodigoAno(escola.codigo, escola.ano)}
                        </span>
                        <span className="text-xs text-muted-foreground sm:hidden">
                          {formatPhone(escola.phone)}
                        </span>
                        <span className="text-xs text-muted-foreground md:hidden">
                          {getRepresentanteName(escola.representanteId)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {formatCodigoAno(escola.codigo, escola.ano)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {formatPhone(escola.phone)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {getRepresentanteName(escola.representanteId)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={(event) => {
                              event.preventDefault();
                              setEditingEscola(escola);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={(event) => {
                              event.preventDefault();
                              setDeletingEscola(escola);
                            }}
                          >
                            <TrashIcon className="h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog
        open={editingEscola !== null}
        onOpenChange={(open) => {
          if (!open) setEditingEscola(null);
        }}
      >
        {editingEscola && (
          <UpsertEscolaForm
            escola={editingEscola}
            representantes={representantes}
            pacotes={pacotes}
            onSuccess={() => setEditingEscola(null)}
          />
        )}
      </Dialog>

      <AlertDialog
        open={deletingEscola !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingEscola(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Tem certeza que quer deletar essa escola?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser revertida. Isso irá deletar a escola e todos
              os alunos a ela atribuídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEscola}
              disabled={deleteEscolaAction.isPending}
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EscolasTable;

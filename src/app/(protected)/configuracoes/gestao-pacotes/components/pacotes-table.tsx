"use client";

/* eslint-disable simple-import-sort/imports */

import type { InferSelectModel } from "drizzle-orm";
import { Edit, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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

import { deletePacote } from "@/actions/delete-pacote";
import { pacotesTable } from "@/db/schema";
import UpsertPacoteDialog from "./upsert-pacote-dialog";

type Pacote = InferSelectModel<typeof pacotesTable>;

interface PacotesTableProps {
  pacotes: Pacote[];
}

const PacotesTable = ({ pacotes }: PacotesTableProps) => {
  const [editingPacote, setEditingPacote] = useState<Pacote | null>(null);

  const deletePacoteAction = useAction(deletePacote, {
    onSuccess: () => {
      toast.success("Pacote deletado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao deletar pacote");
    },
  });

  const handleDelete = (id: string) => {
    deletePacoteAction.execute({ id });
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
        <thead className="bg-slate-50 dark:bg-slate-950/60">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Nome
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Colação
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Baile
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Álbum
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pendrive
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              C.I
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              C.M
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              C.E.I
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              C.E.M
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
          {pacotes.length === 0 ? (
            <tr>
              <td
                colSpan={10}
                className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400"
              >
                Nenhum pacote cadastrado ainda.
              </td>
            </tr>
          ) : (
            pacotes.map((pacote) => (
              <tr key={pacote.id}>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  {pacote.name}
                </td>
                <td className="px-4 py-3 text-center text-sm text-slate-700 dark:text-slate-200">
                  {pacote.colacao || "-"}
                </td>
                <td className="px-4 py-3 text-center text-sm text-slate-700 dark:text-slate-200">
                  {pacote.baile || "-"}
                </td>
                <td className="px-4 py-3 text-center text-sm text-slate-700 dark:text-slate-200">
                  {pacote.album || "-"}
                </td>
                <td className="px-4 py-3 text-center text-sm text-slate-700 dark:text-slate-200">
                  {pacote.pendrive || "-"}
                </td>
                <td className="px-4 py-3 text-center text-sm text-slate-700 dark:text-slate-200">
                  {pacote.conviteInteira || "-"}
                </td>
                <td className="px-4 py-3 text-center text-sm text-slate-700 dark:text-slate-200">
                  {pacote.conviteMeia || "-"}
                </td>
                <td className="px-4 py-3 text-center text-sm text-slate-700 dark:text-slate-200">
                  {pacote.conviteExtraInteira || "-"}
                </td>
                <td className="px-4 py-3 text-center text-sm text-slate-700 dark:text-slate-200">
                  {pacote.conviteExtraMeia || "-"}
                </td>
                <td className="px-4 py-3 text-right text-sm text-slate-700 dark:text-slate-200">
                  <div className="flex justify-end gap-2">
                    <Dialog
                      open={!!editingPacote && editingPacote.id === pacote.id}
                      onOpenChange={(open) => {
                        if (open) {
                          setEditingPacote(pacote);
                        } else {
                          setEditingPacote(null);
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      {editingPacote && editingPacote.id === pacote.id && (
                        <UpsertPacoteDialog
                          isOpen={!!editingPacote}
                          onSuccess={() => setEditingPacote(null)}
                          pacote={editingPacote}
                        />
                      )}
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Tem certeza que deseja excluir este pacote?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O pacote será removido
                            definitivamente do sistema.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(pacote.id)}
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PacotesTable;


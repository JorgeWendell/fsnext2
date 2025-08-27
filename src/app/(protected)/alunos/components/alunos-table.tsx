"use client";
import { Edit,TrashIcon } from "lucide-react";
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
  alunos: typeof alunosTable.$inferSelect[];
  escolas: Escola[];
}

const AlunosTable = ({ alunos, escolas }: AlunosTableProps) => {
  const [editingAluno, setEditingAluno] = useState<typeof alunosTable.$inferSelect | null>(null);

  const getEscolaName = (escolaId: string) => {
    const escola = escolas.find(e => e.id === escolaId);
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Classe</TableHead>
            <TableHead>Escola</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Endereço</TableHead>
            <TableHead>Sexo</TableHead>
            <TableHead>Álbum</TableHead>
            <TableHead>Colação</TableHead>
            <TableHead>Baile</TableHead>
            <TableHead>Convite Extra</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {alunos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="text-center text-muted-foreground">
                Nenhum aluno encontrado
              </TableCell>
            </TableRow>
          ) : (
            alunos.map((aluno) => (
              <TableRow key={aluno.id}>
                <TableCell className="font-medium">{aluno.name}</TableCell>
                <TableCell>{aluno.class}</TableCell>
                <TableCell>{getEscolaName(aluno.escola)}</TableCell>
                <TableCell>{aluno.phone || "-"}</TableCell>
                <TableCell>{aluno.address || "-"}</TableCell>
                <TableCell>{formatSex(aluno.sex)}</TableCell>
                <TableCell>
                  {(aluno as typeof alunosTable.$inferSelect & { album?: boolean; valor_album?: string })?.album ? (
                    <div>
                      <div>Sim</div>
                      {(aluno as typeof alunosTable.$inferSelect & { album?: boolean; valor_album?: string })?.valor_album && (
                        <div className="text-xs text-muted-foreground">
                          R$ {parseFloat((aluno as typeof alunosTable.$inferSelect & { album?: boolean; valor_album?: string }).valor_album || '0').toFixed(2).replace('.', ',')}
                        </div>
                      )}
                    </div>
                  ) : "Não"}
                </TableCell>
                <TableCell>
                  {(aluno as typeof alunosTable.$inferSelect & { colacao?: boolean; valor_colacao?: string })?.colacao ? (
                    <div>
                      <div>Sim</div>
                      {(aluno as typeof alunosTable.$inferSelect & { colacao?: boolean; valor_colacao?: string })?.valor_colacao && (
                        <div className="text-xs text-muted-foreground">
                          R$ {parseFloat((aluno as typeof alunosTable.$inferSelect & { colacao?: boolean; valor_colacao?: string }).valor_colacao || '0').toFixed(2).replace('.', ',')}
                        </div>
                      )}
                    </div>
                  ) : "Não"}
                </TableCell>
                <TableCell>
                  {(aluno as typeof alunosTable.$inferSelect & { baile?: boolean; valor_baile?: string })?.baile ? (
                    <div>
                      <div>Sim</div>
                      {(aluno as typeof alunosTable.$inferSelect & { baile?: boolean; valor_baile?: string })?.valor_baile && (
                        <div className="text-xs text-muted-foreground">
                          R$ {parseFloat((aluno as typeof alunosTable.$inferSelect & { baile?: boolean; valor_baile?: string }).valor_baile || '0').toFixed(2).replace('.', ',')}
                        </div>
                      )}
                    </div>
                  ) : "Não"}
                </TableCell>
                <TableCell>
                  {(aluno as typeof alunosTable.$inferSelect & { convite_extra?: boolean; valor_convite_extra?: string })?.convite_extra ? (
                    <div>
                      <div>Sim</div>
                      {(aluno as typeof alunosTable.$inferSelect & { convite_extra?: boolean; valor_convite_extra?: string })?.valor_convite_extra && (
                        <div className="text-xs text-muted-foreground">
                          R$ {parseFloat((aluno as typeof alunosTable.$inferSelect & { convite_extra?: boolean; valor_convite_extra?: string }).valor_convite_extra || '0').toFixed(2).replace('.', ',')}
                        </div>
                      )}
                    </div>
                  ) : "Não"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
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
                            Essa ação não pode ser revertida. Isso irá deletar o Aluno e
                            todos os dados relacionados a ele.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteAlunoClick(aluno.id)}>
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
    </>
  );
};

export default AlunosTable;

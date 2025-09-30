"use client";
import { FileText } from "lucide-react";
import { useState } from "react";

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
import { alunosTable, financesTable } from "@/db/schema";

import ReportDialog from "./report-dialog";

interface Escola {
  id: string;
  name: string;
  codigo: string;
}

interface Props {
  alunos: (typeof alunosTable.$inferSelect)[];
  escolas: Escola[];
  finances: (typeof financesTable.$inferSelect)[];
}

const ReportsTable = ({ alunos, escolas, finances }: Props) => {
  const [selectedAluno, setSelectedAluno] = useState<
    typeof alunosTable.$inferSelect | null
  >(null);
  const getEscolaName = (id: string) =>
    escolas.find((e) => e.id === id)?.name ?? "-";
  const getEscolaCodigo = (id: string) =>
    escolas.find((e) => e.id === id)?.codigo ?? "-";

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código</TableHead>
          <TableHead>Aluno</TableHead>
          <TableHead>Escola</TableHead>
          <TableHead>Classe</TableHead>
          <TableHead className="text-right">Relatórios</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {alunos.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={5}
              className="text-center text-muted-foreground"
            >
              Nenhum resultado
            </TableCell>
          </TableRow>
        ) : (
          alunos.map((aluno) => {
            const alunoFinances = finances.filter(
              (f) => f.alunoId === aluno.id
            );
            return (
              <TableRow key={aluno.id}>
                <TableCell>
                  {aluno.codigo}/{getEscolaCodigo(aluno.escola)}/
                  {aluno.ano_formacao}
                </TableCell>
                <TableCell className="font-medium">{aluno.name}</TableCell>
                <TableCell>{getEscolaName(aluno.escola)}</TableCell>
                <TableCell>{aluno.class}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedAluno(aluno)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Ver
                        </Button>
                      </DialogTrigger>
                      {selectedAluno && selectedAluno.id === aluno.id && (
                        <ReportDialog
                          aluno={selectedAluno}
                          finances={alunoFinances}
                          escolas={escolas}
                        />
                      )}
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
};

export default ReportsTable;

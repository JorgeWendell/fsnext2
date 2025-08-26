"use client";
import { DollarSign } from "lucide-react";
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

import FinanceiroDialog from "./financeiro-dialog";

type Escola = {
  id: string;
  name: string;
};

interface FinanceiroTableProps {
  alunos: typeof alunosTable.$inferSelect[];
  escolas: Escola[];
  finances: typeof financesTable.$inferSelect[];
  getEscolaName: (escolaId: string) => string;
  getAlunoName: (alunoId: string) => string;
  getAlunoClass: (alunoId: string) => string;
  getAlunoEscola: (alunoId: string) => string;
  onRefresh: () => void;
}

const FinanceiroTable = ({ 
  alunos, 
  finances,
  getEscolaName,
  onRefresh
}: FinanceiroTableProps) => {
  const [selectedAluno, setSelectedAluno] = useState<typeof alunosTable.$inferSelect | null>(null);

  const handleViewFinanceiro = (aluno: typeof alunosTable.$inferSelect) => {
    setSelectedAluno(aluno);
  };

  const handleCloseDialog = () => {
    setSelectedAluno(null);
  };

  const getAlunoFinances = (alunoId: string) => {
    return finances.filter(finance => finance.alunoId === alunoId);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome do Aluno</TableHead>
            <TableHead>Escola</TableHead>
            <TableHead>Classe</TableHead>
            <TableHead className="text-right">Dados Financeiros</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {alunos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                Nenhum aluno encontrado
              </TableCell>
            </TableRow>
          ) : (
            alunos.map((aluno) => {
              const alunoFinances = getAlunoFinances(aluno.id);
              const hasFinances = alunoFinances.length > 0;
              
              return (
                <TableRow key={aluno.id}>
                  <TableCell className="font-medium">{aluno.name}</TableCell>
                  <TableCell>{getEscolaName(aluno.escola)}</TableCell>
                  <TableCell>{aluno.class}</TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant={hasFinances ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleViewFinanceiro(aluno)}
                        >
                          <DollarSign className="h-4 w-4 mr-2" />
                          {hasFinances ? `${alunoFinances.length} registro(s)` : "Sem registros"}
                        </Button>
                      </DialogTrigger>
                                             {selectedAluno && selectedAluno.id === aluno.id && (
                                                   <FinanceiroDialog
                            aluno={selectedAluno}
                            finances={alunoFinances}
                            onClose={handleCloseDialog}
                            onRefresh={onRefresh}
                          />
                       )}
                    </Dialog>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </>
  );
};

export default FinanceiroTable;

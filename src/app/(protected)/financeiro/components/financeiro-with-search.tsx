"use client";
import { Search } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { alunosTable, financesTable } from "@/db/schema";

import FinanceiroTable from "./financeiro-table";

type Escola = {
  id: string;
  name: string;
  codigo: string;
};

interface FinanceiroWithSearchProps {
  alunos: typeof alunosTable.$inferSelect[];
  escolas: Escola[];
  finances: typeof financesTable.$inferSelect[];
  onRefresh: () => void;
}

const FinanceiroWithSearch = ({ alunos, escolas, finances, onRefresh }: FinanceiroWithSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const getEscolaName = (escolaId: string) => {
    const escola = escolas.find(e => e.id === escolaId);
    return escola?.name || "Escola não encontrada";
  };

  const getEscolaByCodigo = (codigo: string) => {
    return escolas.find(e => e.codigo === codigo);
  };

  const getAlunoName = (alunoId: string) => {
    const aluno = alunos.find(a => a.id === alunoId);
    return aluno?.name || "Aluno não encontrado";
  };

  const getAlunoClass = (alunoId: string) => {
    const aluno = alunos.find(a => a.id === alunoId);
    return aluno?.class || "Classe não encontrada";
  };

  const getAlunoEscola = (alunoId: string) => {
    const aluno = alunos.find(a => a.id === alunoId);
    if (!aluno) return "Escola não encontrada";
    return getEscolaName(aluno.escola);
  };

  const filteredAlunos = alunos.filter((aluno) => {
    if (!searchTerm.trim()) {
      return true;
    }

    const searchLower = searchTerm.toLowerCase().trim();

    if (searchTerm.includes("/")) {
      const parts = searchTerm.split("/");
      if (parts.length === 2) {
        const codigoAluno = parts[0].trim();
        const codigoEscola = parts[1].trim();

        const escolaEncontrada = getEscolaByCodigo(codigoEscola);

        if (escolaEncontrada) {
          return (
            aluno.codigo === codigoAluno &&
            aluno.escola === escolaEncontrada.id
          );
        }

        return false;
      }
    }

    return (
      aluno.name.toLowerCase().includes(searchLower) ||
      aluno.codigo.toLowerCase().includes(searchLower) ||
      aluno.class.toLowerCase().includes(searchLower) ||
      getEscolaName(aluno.escola).toLowerCase().includes(searchLower) ||
      getEscolaByCodigo(searchTerm)?.id === aluno.escola
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar alunos... (ex: 001/100 para código aluno/escola)"
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <FinanceiroTable 
        alunos={filteredAlunos} 
        escolas={escolas} 
        finances={finances}
        getEscolaName={getEscolaName}
        getAlunoName={getAlunoName}
        getAlunoClass={getAlunoClass}
        getAlunoEscola={getAlunoEscola}
        onRefresh={onRefresh}
      />
    </div>
  );
};

export default FinanceiroWithSearch;

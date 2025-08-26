"use client";
import { Search } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { alunosTable, financesTable } from "@/db/schema";

import FinanceiroTable from "./financeiro-table";

type Escola = {
  id: string;
  name: string;
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

  // Filtrar alunos baseado no termo de busca
  const filteredAlunos = alunos.filter((aluno) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      aluno.name.toLowerCase().includes(searchLower) ||
      aluno.class.toLowerCase().includes(searchLower) ||
      getEscolaName(aluno.escola).toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar alunos..."
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

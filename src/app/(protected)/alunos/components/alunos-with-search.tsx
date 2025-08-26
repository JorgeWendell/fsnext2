"use client";
import { Search } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { alunosTable } from "@/db/schema";

import AlunosTable from "./alunos-table";

type Escola = {
  id: string;
  name: string;
};

interface AlunosWithSearchProps {
  alunos: typeof alunosTable.$inferSelect[];
  escolas: Escola[];
}

const AlunosWithSearch = ({ alunos, escolas }: AlunosWithSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const getEscolaName = (escolaId: string) => {
    const escola = escolas.find(e => e.id === escolaId);
    return escola?.name || "Escola não encontrada";
  };

  const formatSex = (sex: string) => {
    return sex === "male" ? "Masculino" : "Feminino";
  };

  // Filtrar alunos baseado no termo de busca
  const filteredAlunos = alunos.filter((aluno) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      aluno.name.toLowerCase().includes(searchLower) ||
      aluno.class.toLowerCase().includes(searchLower) ||
      aluno.phone.toLowerCase().includes(searchLower) ||
      aluno.address.toLowerCase().includes(searchLower) ||
      getEscolaName(aluno.escola).toLowerCase().includes(searchLower) ||
      formatSex(aluno.sex).toLowerCase().includes(searchLower) ||
      ((aluno as typeof alunosTable.$inferSelect & { album?: boolean })?.album ? "sim" : "não").includes(searchLower) ||
      ((aluno as typeof alunosTable.$inferSelect & { colacao?: boolean })?.colacao ? "sim" : "não").includes(searchLower) ||
      ((aluno as typeof alunosTable.$inferSelect & { baile?: boolean })?.baile ? "sim" : "não").includes(searchLower) ||
      ((aluno as typeof alunosTable.$inferSelect & { convite_extra?: boolean })?.convite_extra ? "sim" : "não").includes(searchLower) ||
      ((aluno as typeof alunosTable.$inferSelect & { valor_album?: string })?.valor_album || "").includes(searchLower) ||
      ((aluno as typeof alunosTable.$inferSelect & { valor_colacao?: string })?.valor_colacao || "").includes(searchLower) ||
      ((aluno as typeof alunosTable.$inferSelect & { valor_baile?: string })?.valor_baile || "").includes(searchLower) ||
      ((aluno as typeof alunosTable.$inferSelect & { valor_convite_extra?: string })?.valor_convite_extra || "").includes(searchLower) ||
      "álbum".includes(searchLower) ||
      "colação".includes(searchLower) ||
      "baile".includes(searchLower) ||
      "convite extra".includes(searchLower)
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
      <AlunosTable alunos={filteredAlunos} escolas={escolas} />
    </div>
  );
};

export default AlunosWithSearch;

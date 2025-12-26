"use client";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredAlunos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAlunos = filteredAlunos.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Input
            placeholder="Buscar alunos... (ex: 001/100)"
            className="w-full sm:max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          {filteredAlunos.length} aluno(s) encontrado(s)
        </div>
      </div>
      <FinanceiroTable 
        alunos={paginatedAlunos} 
        escolas={escolas} 
        finances={finances}
        getEscolaName={getEscolaName}
        getAlunoName={getAlunoName}
        getAlunoClass={getAlunoClass}
        getAlunoEscola={getAlunoEscola}
        onRefresh={onRefresh}
      />
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                  }
                }}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
            {getPageNumbers().map((page, index) => (
              <PaginationItem key={index}>
                {page === "ellipsis" ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(page);
                    }}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) {
                    setCurrentPage(currentPage + 1);
                  }
                }}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default FinanceiroWithSearch;

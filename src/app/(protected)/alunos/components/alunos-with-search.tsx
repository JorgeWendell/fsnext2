"use client";

import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { alunosTable } from "@/db/schema";

import AlunosTable from "./alunos-table";

type Escola = {
  id: string;
  name: string;
  codigo: string;
};

interface AlunosWithSearchProps {
  alunos: typeof alunosTable.$inferSelect[];
  escolas: Escola[];
}

const AlunosWithSearch = ({ alunos, escolas }: AlunosWithSearchProps) => {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const getEscolaName = useCallback(
    (escolaId: string) => {
      const escola = escolas.find((e) => e.id === escolaId);
      return escola?.name || "Escola não encontrada";
    },
    [escolas]
  );

  const getEscolaByCodigo = useCallback(
    (codigo: string) => escolas.find((e) => e.codigo === codigo),
    [escolas]
  );

  const formatSex = (sex: string) => {
    return sex === "male" ? "Masculino" : "Feminino";
  };

  const filteredAlunos = useMemo(() => {
    return alunos.filter((aluno) => {
      if (!searchTerm.trim()) return true;
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
        if (parts.length === 3) {
          const codigoAluno = parts[0].trim();
          const codigoEscola = parts[1].trim();
          const anoSufixo = parts[2].trim();
          const escolaEncontrada = getEscolaByCodigo(codigoEscola);
          if (escolaEncontrada) {
            return (
              aluno.codigo === codigoAluno &&
              aluno.escola === escolaEncontrada.id &&
              aluno.ano_formacao.endsWith(anoSufixo)
            );
          }
          return false;
        }
      }
      const alunoExt = aluno as typeof alunosTable.$inferSelect & {
        album?: boolean;
        colacao?: boolean;
        baile?: boolean;
        convite_extra?: boolean;
        valor_album?: string;
        valor_colacao?: string;
        valor_baile?: string;
        valor_convite_extra?: string;
      };
      return (
        aluno.name.toLowerCase().includes(searchLower) ||
        aluno.codigo.toLowerCase().includes(searchLower) ||
        aluno.class.toLowerCase().includes(searchLower) ||
        (aluno.phone || "").toLowerCase().includes(searchLower) ||
        (aluno.address || "").toLowerCase().includes(searchLower) ||
        getEscolaName(aluno.escola).toLowerCase().includes(searchLower) ||
        getEscolaByCodigo(searchTerm)?.id === aluno.escola ||
        formatSex(aluno.sex).toLowerCase().includes(searchLower) ||
        (alunoExt?.album ? "sim" : "não").includes(searchLower) ||
        (alunoExt?.colacao ? "sim" : "não").includes(searchLower) ||
        (alunoExt?.baile ? "sim" : "não").includes(searchLower) ||
        (alunoExt?.convite_extra ? "sim" : "não").includes(searchLower) ||
        (alunoExt?.valor_album || "").includes(searchLower) ||
        (alunoExt?.valor_colacao || "").includes(searchLower) ||
        (alunoExt?.valor_baile || "").includes(searchLower) ||
        (alunoExt?.valor_convite_extra || "").includes(searchLower) ||
        "álbum".includes(searchLower) ||
        "colação".includes(searchLower) ||
        "baile".includes(searchLower) ||
        "convite extra".includes(searchLower)
      );
    });
  }, [alunos, searchTerm, getEscolaName, getEscolaByCodigo]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    const initialSearch = searchParams.get("search") || "";
    setSearchTerm(initialSearch);
  }, [searchParams]);

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
      <AlunosTable alunos={paginatedAlunos} escolas={escolas} />
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

export default AlunosWithSearch;

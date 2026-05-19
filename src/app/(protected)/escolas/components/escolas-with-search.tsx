"use client";

import { Search } from "lucide-react";
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
import { escolasTable, pacotesTable } from "@/db/schema";

import EscolasTable from "./escolas-table";

type Representante = {
  id: string;
  name: string;
};

type Pacote = typeof pacotesTable.$inferSelect;

interface EscolasWithSearchProps {
  escolas: (typeof escolasTable.$inferSelect)[];
  representantes: Representante[];
  pacotes: Pacote[];
}

const EscolasWithSearch = ({
  escolas,
  representantes,
  pacotes,
}: EscolasWithSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const getRepresentanteName = useCallback(
    (representanteId: string | null) => {
      if (!representanteId) return "";
      const representante = representantes.find((item) => item.id === representanteId);
      return representante?.name ?? "";
    },
    [representantes],
  );

  const filteredEscolas = useMemo(
    () =>
      escolas.filter((escola) => {
        if (!searchTerm.trim()) return true;
        const searchLower = searchTerm.toLowerCase().trim();
        const anoSuffix = escola.ano ? escola.ano.slice(-2) : "";
        const codigoAno = `${escola.codigo}/${anoSuffix}`.toLowerCase();

        return (
          escola.name.toLowerCase().includes(searchLower) ||
          escola.codigo.toLowerCase().includes(searchLower) ||
          codigoAno.includes(searchLower) ||
          (escola.phone || "").toLowerCase().includes(searchLower) ||
          (escola.address || "").toLowerCase().includes(searchLower) ||
          getRepresentanteName(escola.representanteId)
            .toLowerCase()
            .includes(searchLower)
        );
      }),
    [escolas, searchTerm, getRepresentanteName],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredEscolas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEscolas = filteredEscolas.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (currentPage <= 3) {
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

    return pages;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex w-full items-center space-x-2 sm:w-auto">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            placeholder="Buscar escolas..."
            className="w-full sm:max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="whitespace-nowrap text-sm text-muted-foreground">
          {filteredEscolas.length} escola(s) encontrada(s)
        </div>
      </div>

      <EscolasTable
        escolas={paginatedEscolas}
        representantes={representantes}
        pacotes={pacotes}
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

export default EscolasWithSearch;

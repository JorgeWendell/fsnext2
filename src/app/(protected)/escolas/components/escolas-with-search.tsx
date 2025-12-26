"use client";
import { Search } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { escolasTable } from "@/db/schema";

import EscolaCard from "./escola-card";

type Representante = {
  id: string;
  name: string;
};

interface EscolasWithSearchProps {
  escolas: typeof escolasTable.$inferSelect[];
  representantes: Representante[];
}

const EscolasWithSearch = ({ escolas, representantes }: EscolasWithSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEscolas = escolas.filter((escola) => {
    if (!searchTerm.trim()) {
      return true;
    }

    const searchLower = searchTerm.toLowerCase().trim();

    return (
      escola.name.toLowerCase().includes(searchLower) ||
      escola.codigo.toLowerCase().includes(searchLower) ||
      (escola.phone || "").toLowerCase().includes(searchLower) ||
      (escola.address || "").toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar escolas por código, nome, telefone ou endereço..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {filteredEscolas.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          Nenhuma escola encontrada
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-6">
          {filteredEscolas.map((escola) => (
            <EscolaCard
              key={escola.id}
              escola={escola}
              representantes={representantes}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EscolasWithSearch;


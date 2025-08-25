"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { alunosTable } from "@/db/schema";
import AlbunsTable from "./albuns-table";

type Escola = { id: string; name: string };

interface Props {
  alunos: typeof alunosTable.$inferSelect[];
  escolas: Escola[];
  onRefresh: () => void;
}

const AlbunsWithSearch = ({ alunos, escolas, onRefresh }: Props) => {
  const [term, setTerm] = useState("");

  const getEscolaName = (id: string) => escolas.find(e=>e.id===id)?.name ?? "-";

  const filtered = alunos.filter((a)=>{
    const t = term.toLowerCase();
    return a.name.toLowerCase().includes(t) || getEscolaName(a.escola).toLowerCase().includes(t);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por aluno ou escola..." className="max-w-sm" value={term} onChange={(e)=>setTerm(e.target.value)} />
      </div>
      <AlbunsTable alunos={filtered} escolas={escolas} />
    </div>
  );
};

export default AlbunsWithSearch;

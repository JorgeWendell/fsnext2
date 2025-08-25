"use client";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { alunosTable, financesTable } from "@/db/schema";
import ReportsTable from "./reports-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Escola = { id: string; name: string };

interface Props {
  alunos: typeof alunosTable.$inferSelect[];
  escolas: Escola[];
  finances: typeof financesTable.$inferSelect[];
  onRefresh: () => void;
}

const currency = (v: string | number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL"}).format(typeof v === 'string' ? parseFloat(v||'0') : v);

const ReportsWithSearch = ({ alunos, escolas, finances, onRefresh }: Props) => {
  const [term, setTerm] = useState("");
  const [schoolId, setSchoolId] = useState<string>("");

  const getEscolaName = (id: string) => escolas.find(e=>e.id===id)?.name ?? "-";

  const filteredAlunos = useMemo(() => {
    const t = term.toLowerCase();
    return alunos.filter(a =>
      a.name.toLowerCase().includes(t) ||
      getEscolaName(a.escola).toLowerCase().includes(t)
    );
  }, [alunos, term]);

  const handleExportSchoolPdf = () => {
    if (!schoolId) return;
    const schoolName = getEscolaName(schoolId);
    const alunosDaEscola = alunos.filter(a => a.escola === schoolId);

    const doc = new jsPDF();
    doc.text(`Relatório Financeiro - Escola: ${schoolName}`, 14, 14);

    let cursorY = 22;
    let totalEscola = 0;

    alunosDaEscola.forEach((aluno, index) => {
      const alunoFinances = finances.filter(f => f.alunoId === aluno.id);
      const totalAluno = alunoFinances.reduce((s, f) => s + (parseFloat(f.valueTotal) || 0), 0);
      totalEscola += totalAluno;

      // Espaçamento extra entre alunos (exceto primeiro)
      if (index > 0) {
        cursorY = ((doc as any).lastAutoTable?.finalY ?? cursorY) + 18;
        doc.setDrawColor(200);
        doc.line(14, cursorY - 8, 196, cursorY - 8);
      }

      doc.setTextColor(0);
      doc.text(`${aluno.name} - Classe: ${aluno.class}`, 14, cursorY);

      autoTable(doc, {
        startY: cursorY + 4,
        head: [["Data", "Método", "Parcela", "Valor"]],
        body: alunoFinances.map(f => [
          new Date(f.createdAt).toLocaleDateString('pt-BR'),
          f.method,
          f.bank_slip ?? "-",
          currency(f.valueTotal),
        ]),
        styles: { fontSize: 10 },
        didDrawPage: (data) => {
          cursorY = data.cursor.y;
        }
      });

      const afterTableY = (doc as any).lastAutoTable?.finalY ?? cursorY + 6;
      // Apenas espaçamento, sem exibir "Total do aluno"
      cursorY = afterTableY + 20;
    });

    const finalY = (doc as any).lastAutoTable?.finalY ?? cursorY;
    const sumY = finalY + 12 > 280 ? 20 : finalY + 12;
    doc.text(`Total da escola: ${currency(totalEscola)}`, 14, sumY);
    doc.save(`relatorio-escola-${schoolName}.pdf`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por aluno ou escola..." className="max-w-sm" value={term} onChange={(e)=>setTerm(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <Select value={schoolId} onValueChange={setSchoolId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Selecionar escola" />
            </SelectTrigger>
            <SelectContent>
              {escolas.map(e => (
                <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleExportSchoolPdf} disabled={!schoolId}>
            Exportar PDF da Escola
          </Button>
        </div>
      </div>
      <ReportsTable alunos={filteredAlunos} escolas={escolas} finances={finances} />
    </div>
  );
};

export default ReportsWithSearch;

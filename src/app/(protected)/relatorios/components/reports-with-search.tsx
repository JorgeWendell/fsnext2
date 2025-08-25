"use client";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { alunosTable, financesTable } from "@/db/schema";
import { Search } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ReportsTable from "./reports-table";

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

    const doc = new jsPDF('landscape');
    
         // Cabeçalho do relatório
     doc.setFontSize(12);
     doc.setFont("helvetica", "normal");
     doc.text(`Nome da Escola: ${schoolName}`, 14, 25);

    // Preparar dados para a tabela
    const tableData = alunosDaEscola.map((aluno, index) => {
      const alunoFinances = finances.filter(f => f.alunoId === aluno.id);
      const totalAluno = alunoFinances.reduce((s, f) => s + (parseFloat(f.valueTotal) || 0), 0);
      
      // Pegar o primeiro pagamento para data e método
      const primeiroPagamento = alunoFinances[0];
      const metodoPagamento = primeiroPagamento?.method || "-";
      const dataPrimeiroPagamento = primeiroPagamento?.createdAt 
        ? new Date(primeiroPagamento.createdAt).toLocaleDateString('pt-BR')
        : "-";
      
      return [
        `${aluno.name} ${index + 1}`, // Nome do aluno com número
        aluno.class, // Classe
        metodoPagamento.toUpperCase(), // Método de pagamento em maiúsculo
        dataPrimeiroPagamento, // Data do primeiro pagamento
        currency(totalAluno).replace("R$", "").trim() // Valor total sem R$
      ];
    });

    // Calcular total da escola
    const totalEscola = alunosDaEscola.reduce((total, aluno) => {
      const alunoFinances = finances.filter(f => f.alunoId === aluno.id);
      return total + alunoFinances.reduce((s, f) => s + (parseFloat(f.valueTotal) || 0), 0);
    }, 0);

    // Criar tabela
    autoTable(doc, {
      startY: 40,
      head: [["Aluno", "Classe", "Metodo de Pagamento", "Data primeiro pagamento", "Valor total"]],
      body: tableData,
      styles: { 
        fontSize: 10,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [41, 128, 185], // Cor azul escura para o cabeçalho
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 40, right: 14, bottom: 20, left: 14 }
    });

    // Adicionar total da escola no final
    const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 250;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Total da Escola: ${currency(totalEscola)}`, 14, finalY + 15);
    
         doc.save(`relatorio-escola-${schoolName}.pdf`);
   };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por aluno..." className="max-w-sm" value={term} onChange={(e)=>setTerm(e.target.value)} />
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

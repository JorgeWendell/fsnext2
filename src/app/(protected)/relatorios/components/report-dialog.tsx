"use client";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { alunosTable, financesTable } from "@/db/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Escola { id: string; name: string }

interface Props {
  aluno: typeof alunosTable.$inferSelect;
  finances: typeof financesTable.$inferSelect[];
  escolas: Escola[];
}

const currency = (v: string | number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL"}).format(typeof v === 'string' ? parseFloat(v||'0') : v);

const ReportDialog = ({ aluno, finances, escolas }: Props) => {
  const totalAluno = finances.reduce((s, f)=> s + (parseFloat(f.valueTotal)||0), 0);
  const escolaName = escolas.find(e=>e.id===aluno.escola)?.name ?? "-";

  const handlePdf = () => {
    const doc = new jsPDF();
    doc.text(`Relatório Financeiro - ${aluno.name}`, 14, 14);
    doc.text(`Escola: ${escolaName} | Classe: ${aluno.class}`, 14, 22);
    // tabela
    autoTable(doc, {
      startY: 28,
      head: [["Data", "Método", "Parcela", "Valor"]],
      body: finances.map(f=>[
        new Date(f.createdAt).toLocaleDateString('pt-BR'),
        f.method,
        f.bank_slip ?? "-",
        currency(f.valueTotal)
      ]),
      styles: { fontSize: 10 },
    });
    const y = (doc as any).lastAutoTable.finalY + 10;
    doc.text(`Total do aluno: ${currency(totalAluno)}`, 14, y);
    doc.save(`relatorio-${aluno.name}.pdf`);
  };

  return (
    <DialogContent className="w-full max-w-3xl">
      <DialogHeader>
        <DialogTitle>Relatório - {aluno.name}</DialogTitle>
        <DialogDescription>Financeiro detalhado do aluno e total por escola</DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg mb-4">
        <div>
          <div className="text-sm text-muted-foreground">Escola</div>
          <div className="text-lg">{escolaName}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Classe</div>
          <div className="text-lg">{aluno.class}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Total do Aluno</div>
          <div className="text-lg font-semibold text-green-600">{currency(totalAluno)}</div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Método</TableHead>
            <TableHead>Parcela</TableHead>
            <TableHead className="text-right">Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {finances.map((f)=> (
            <TableRow key={f.id}>
              <TableCell>{new Date(f.createdAt).toLocaleDateString('pt-BR')}</TableCell>
              <TableCell>{f.method}</TableCell>
              <TableCell>{f.bank_slip ?? '-'}</TableCell>
              <TableCell className="text-right">{currency(f.valueTotal)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-end mt-4">
        <Button onClick={handlePdf}>
          Exportar PDF
        </Button>
      </div>
    </DialogContent>
  );
};

export default ReportDialog;

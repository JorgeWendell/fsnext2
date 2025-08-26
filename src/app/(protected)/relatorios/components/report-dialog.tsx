"use client";
import { addMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { alunosTable, financesTable } from "@/db/schema";

interface Escola { id: string; name: string }

interface Props {
  aluno: typeof alunosTable.$inferSelect;
  finances: typeof financesTable.$inferSelect[];
  escolas: Escola[];
}

const currency = (v: string | number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL"}).format(typeof v === 'string' ? parseFloat(v||'0') : v);

const ReportDialog = ({ aluno, finances, escolas }: Props) => {
  // Calcular total dos itens financeiros do aluno
  const valorAlbum = parseFloat(aluno.valor_album || '0');
  const valorColacao = parseFloat(aluno.valor_colacao || '0');
  const valorBaile = parseFloat(aluno.valor_baile || '0');
  const valorConviteExtra = parseFloat(aluno.valor_convite_extra || '0');
  
  const totalItensAluno = valorAlbum + valorColacao + valorBaile + valorConviteExtra;
  // totalPagamentos removed as it's not being used
  const escolaName = escolas.find(e=>e.id===aluno.escola)?.name ?? "-";

  const handlePdf = () => {
    const doc = new jsPDF('landscape');
    
    // Cabeçalho do relatório
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Nome do Aluno: ${aluno.name}`, 14, 25);

    // Espaçamento inicial para a tabela de meses
    const finalY = 30;

    // Pagamentos mês a mês do aluno
    const monthsCount = 12;
    
    // Ordenar pagamentos por data e pegar o primeiro
    const sortedFinances = finances
      .slice()
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    const first = sortedFinances[0];
    
    if (!first) {
      // Sem pagamentos
      doc.text("Nenhum pagamento registrado", 14, finalY + 10);
      doc.save(`relatorio-${aluno.name}.pdf`);
      return;
    }

    const firstDate = new Date(first.createdAt);
    
    // Criar cabeçalho com nomes dos meses
    const monthHeader = ["Total do aluno"];
    for (let i = 0; i < monthsCount; i++) {
      const monthDate = addMonths(firstDate, i);
      const monthName = format(monthDate, 'MMM/yy', { locale: ptBR });
      monthHeader.push(monthName);
    }

    // Criar linha de dados do aluno
    const monthBody = [];
    for (let i = 0; i < monthsCount; i++) {
      const ref = addMonths(firstDate, i);
      const refMonth = ref.getMonth();
      const refYear = ref.getFullYear();
      
      let monthTotal = 0;
      
      // Processar pagamentos regulares deste mês
      const monthPayments = finances.filter((f) => {
        const d = new Date(f.createdAt);
        return d.getMonth() === refMonth && d.getFullYear() === refYear;
      });
      
      monthPayments.forEach(payment => {
        if (payment.method !== "bank_slip") {
          // Pagamentos não-boleto: adicionar valor total
          monthTotal += parseFloat(payment.valueTotal) || 0;
        }
      });
      
      // Processar boletos parcelados - SOMENTE se o checkbox estiver marcado como pago
      const boletos = finances.filter(f => f.method === "bank_slip");
      boletos.forEach(boleto => {
        const boletoDate = new Date(boleto.createdAt);
        // boletoMonth and boletoYear removed as they're not being used
        
        // Verificar se existe status das parcelas salvo
        const parcelasPagas = boleto.parcelasPagas ? JSON.parse(boleto.parcelasPagas) : {};
        
        // Calcular em qual mês esta parcela vence
        const parcelas = parseInt(boleto.bank_slip || "1");
        const valorParcela = (parseFloat(boleto.valueTotal) || 0) / parcelas;
        
        for (let p = 0; p < parcelas; p++) {
          const parcela = p + 1;
          const vencimentoDate = addMonths(boletoDate, p);
          const vencimentoMonth = vencimentoDate.getMonth();
          const vencimentoYear = vencimentoDate.getFullYear();
          
          // Se o vencimento desta parcela é no mês atual (i) E o checkbox está marcado como pago
          if (vencimentoMonth === refMonth && vencimentoYear === refYear && parcelasPagas[parcela] === true) {
            monthTotal += valorParcela;
          }
        }
      });
      
      if (monthTotal > 0) {
        monthBody.push(currency(monthTotal).replace("R$", "").trim());
      } else {
        monthBody.push("");
      }
    }

    // Adicionar o total do aluno na primeira coluna
    monthBody.unshift(currency(totalItensAluno).replace("R$", "").trim());

    // Calcular total geral (usar total dos itens do aluno)
    const totalGeral = totalItensAluno;

    const startY = finalY;
    autoTable(doc, {
      startY: startY + 5,
      head: [monthHeader],
      body: [monthBody],
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 40, right: 14, bottom: 20, left: 14 },
    });

    // Adicionar informações adicionais
    const tableEndY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    doc.text(`Escola: ${escolaName}`, 14, tableEndY);
    doc.text(`Classe: ${aluno.class}`, 14, tableEndY + 8);
    doc.text(`Total Geral: ${currency(totalGeral)}`, 14, tableEndY + 16);

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
           <div className="text-lg font-semibold text-green-600">{currency(totalItensAluno)}</div>
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

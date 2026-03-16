"use client";
import { addMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { alunoExtrasTable, alunosTable, financesTable } from "@/db/schema";

interface Escola {
  id: string;
  name: string;
  codigo: string;
}

interface Props {
  aluno: typeof alunosTable.$inferSelect;
  finances: (typeof financesTable.$inferSelect)[];
  escolas: Escola[];
  extras: (typeof alunoExtrasTable.$inferSelect)[];
}

const currency = (v: string | number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    typeof v === "string" ? parseFloat(v || "0") : v
  );

const getPaymentMethodName = (method: string) => {
  const methodNames = {
    bank_slip: "Boleto",
    debit: "Débito",
    creditvista: "Crédito",
    creditparc: "Crédito Parcelado",
    pix: "PIX",
  };
  return methodNames[method as keyof typeof methodNames] || method;
};

const ReportDialog = ({ aluno, finances, escolas, extras }: Props) => {
  // Calcular total dos itens financeiros do aluno
  const valorAlbum = parseFloat(aluno.valor_album || "0");
  const valorColacao = parseFloat(aluno.valor_colacao || "0");
  const valorBaile = parseFloat(aluno.valor_baile || "0");
  const valorConviteExtra = parseFloat(aluno.valor_convite_extra || "0");

  const totalItensAluno =
    valorAlbum + valorColacao + valorBaile + valorConviteExtra;
  const escolaName = escolas.find((e) => e.id === aluno.escola)?.name ?? "-";

  const alunoExtras = extras.filter((e) => e.alunoId === aluno.id);

  const handlePdf = () => {
    const doc = new jsPDF("landscape");

    // Cabeçalho do relatório
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Nome do Aluno: ${aluno.name}`, 14, 25);
    doc.text(`Escola: ${escolaName}`, 14, 33);
    doc.text(`Classe: ${aluno.class}`, 14, 41);

    // Espaçamento inicial para a tabela de meses
    const finalY = 46;

    // Pagamentos mês a mês do aluno
    const monthsCount = 12;

    // Ordenar pagamentos por data e pegar o primeiro
    const sortedFinances = finances
      .slice()
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

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
      const monthName = format(monthDate, "MMM/yy", { locale: ptBR });
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

      monthPayments.forEach((payment) => {
        if (payment.method !== "bank_slip") {
          // Pagamentos não-boleto: adicionar valor total
          monthTotal += parseFloat(payment.valueTotal) || 0;
        }
      });

      // Processar boletos parcelados - SOMENTE se o checkbox estiver marcado como pago
      const boletos = finances.filter((f) => f.method === "bank_slip");
      boletos.forEach((boleto) => {
        // Usar a data do primeiro vencimento se disponível, senão usar a data de criação
        let boletoDate: Date;
        if (boleto.firstDueDate) {
          // Corrigir problema de timezone - criar data no timezone local
          const [year, month, day] = boleto.firstDueDate.split("-").map(Number);
          boletoDate = new Date(year, month - 1, day); // month - 1 porque Date usa 0-based months
        } else {
          boletoDate = new Date(boleto.createdAt);
        }

        // Verificar se existe status das parcelas salvo
        const parcelasPagas = boleto.parcelasPagas
          ? JSON.parse(boleto.parcelasPagas)
          : {};

        // Calcular em qual mês esta parcela vence
        const parcelas = parseInt(boleto.bank_slip || "1");
        const valorParcela = (parseFloat(boleto.valueTotal) || 0) / parcelas;

        for (let p = 0; p < parcelas; p++) {
          const parcela = p + 1;
          const vencimentoDate = addMonths(boletoDate, p);
          const vencimentoMonth = vencimentoDate.getMonth();
          const vencimentoYear = vencimentoDate.getFullYear();

          // Se o vencimento desta parcela é no mês atual (i) E o checkbox está marcado como pago
          if (
            vencimentoMonth === refMonth &&
            vencimentoYear === refYear &&
            parcelasPagas[parcela] === true
          ) {
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
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 40, right: 14, bottom: 20, left: 14 },
    });

    // Adicionar informações adicionais
    const tableEndY =
      (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY + 10;
    doc.text(`Total Geral: ${currency(totalGeral)}`, 14, tableEndY);

    // Adicionar seção "Itens Adquiridos"
    let currentY = tableEndY + 16;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Itens Adquiridos:", 14, currentY);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    currentY += 8;

    const itensAdquiridos: string[] = [];
    if (aluno.album) itensAdquiridos.push(`Álbum: ${currency(valorAlbum)}`);
    if (aluno.colacao)
      itensAdquiridos.push(`Colação: ${currency(valorColacao)}`);
    if (aluno.baile) itensAdquiridos.push(`Baile: ${currency(valorBaile)}`);
    if (aluno.convite_extra)
      itensAdquiridos.push(`Convite Extra: ${currency(valorConviteExtra)}`);

    alunoExtras.forEach((extra) => {
      const label =
        extra.type === "album" ? "Álbum extra" : "Convite extra";
      const valor = currency(extra.total);
      const status = extra.paid ? " (Pago)" : "";
      itensAdquiridos.push(`${label}: ${valor}${status}`);
    });

    if (itensAdquiridos.length > 0) {
      itensAdquiridos.forEach((item, index) => {
        doc.text(`• ${item}`, 14, currentY + index * 6);
      });
    } else {
      doc.text("• Nenhum item adquirido", 14, currentY);
    }

    doc.save(`relatorio-${aluno.name}.pdf`);
  };

  return (
    <DialogContent className="w-full max-w-3xl">
      <DialogHeader>
        <DialogTitle>Relatório - {aluno.name}</DialogTitle>
        <DialogDescription>
          Financeiro detalhado do aluno e total por escola
        </DialogDescription>
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
          <div className="text-lg font-semibold text-green-600">
            {currency(totalItensAluno)}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-3">Produtos Adquiridos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className={`p-3 rounded-lg border ${aluno.album ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Álbum</div>
                <div className="text-sm text-muted-foreground">
                  {aluno.album ? currency(valorAlbum) : "Não adquirido"}
                </div>
              </div>
              <div
                className={`w-3 h-3 rounded-full ${aluno.album ? "bg-green-500" : "bg-gray-300"}`}
              ></div>
            </div>
          </div>

          <div
            className={`p-3 rounded-lg border ${aluno.colacao ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Colação</div>
                <div className="text-sm text-muted-foreground">
                  {aluno.colacao ? currency(valorColacao) : "Não adquirido"}
                </div>
              </div>
              <div
                className={`w-3 h-3 rounded-full ${aluno.colacao ? "bg-green-500" : "bg-gray-300"}`}
              ></div>
            </div>
          </div>

          <div
            className={`p-3 rounded-lg border ${aluno.baile ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Baile</div>
                <div className="text-sm text-muted-foreground">
                  {aluno.baile ? currency(valorBaile) : "Não adquirido"}
                </div>
              </div>
              <div
                className={`w-3 h-3 rounded-full ${aluno.baile ? "bg-green-500" : "bg-gray-300"}`}
              ></div>
            </div>
          </div>

          <div
            className={`p-3 rounded-lg border ${aluno.convite_extra ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Convite Extra</div>
                <div className="text-sm text-muted-foreground">
                  {aluno.convite_extra
                    ? currency(valorConviteExtra)
                    : "Não adquirido"}
                </div>
              </div>
              <div
                className={`w-3 h-3 rounded-full ${aluno.convite_extra ? "bg-green-500" : "bg-gray-300"}`}
              ></div>
            </div>
          </div>
        </div>
        {alunoExtras.length > 0 && (
          <div className="mt-4">
            <h4 className="text-md font-semibold mb-2">Itens extras</h4>
            <div className="space-y-2">
              {alunoExtras.map((extra) => (
                <div
                  key={extra.id}
                  className="flex items-center justify-between rounded-lg border p-2"
                >
                  <div>
                    <div className="font-medium">
                      {extra.type === "album" ? "Álbum extra" : "Convite extra"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {currency(extra.total)}
                      {extra.paid ? " (Pago)" : " (Em aberto)"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-3">Histórico de Pagamentos</h3>
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
          {finances.map((f) => (
            <TableRow key={f.id}>
              <TableCell>
                {new Date(f.createdAt).toLocaleDateString("pt-BR")}
              </TableCell>
              <TableCell>{getPaymentMethodName(f.method)}</TableCell>
              <TableCell>{f.bank_slip ?? "-"}</TableCell>
              <TableCell className="text-right">
                {currency(f.valueTotal)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-end mt-4">
        <Button onClick={handlePdf}>Exportar PDF</Button>
      </div>
    </DialogContent>
  );
};

export default ReportDialog;

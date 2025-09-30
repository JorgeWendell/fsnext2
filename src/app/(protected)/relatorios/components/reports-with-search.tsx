"use client";
import { addMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Search } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

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

import ReportsTable from "./reports-table";

type Escola = { id: string; name: string; codigo: string };

interface Props {
  alunos: (typeof alunosTable.$inferSelect)[];
  escolas: Escola[];
  finances: (typeof financesTable.$inferSelect)[];
}

const currency = (v: string | number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    typeof v === "string" ? parseFloat(v || "0") : v
  );

const ReportsWithSearch = ({ alunos, escolas, finances }: Props) => {
  const [term, setTerm] = useState("");
  const [schoolId, setSchoolId] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");

  const getEscolaName = useCallback(
    (id: string) => escolas.find((e) => e.id === id)?.name ?? "-",
    [escolas]
  );

  const uniqueClasses = useMemo(() => {
    const classes = [...new Set(alunos.map((a) => a.class))];
    return classes.sort();
  }, [alunos]);

  const getEscolaCodigo = useCallback(
    (id: string) => escolas.find((e) => e.id === id)?.codigo ?? "",
    [escolas]
  );

  const filteredAlunos = useMemo(() => {
    const t = term.toLowerCase().trim();

    if (t.includes("/")) {
      const parts = t.split("/").map((s) => s.trim());
      const [codigoAluno, codigoEscola, anoFormacao] = parts;

      return alunos.filter((a) => {
        const alunoCodigoMatch = codigoAluno
          ? a.codigo.toLowerCase().includes(codigoAluno)
          : true;
        const escolaCodigoMatch = codigoEscola
          ? getEscolaCodigo(a.escola).toLowerCase().includes(codigoEscola)
          : true;
        const anoFormacaoMatch = anoFormacao
          ? a.ano_formacao.toLowerCase().includes(anoFormacao)
          : true;
        return alunoCodigoMatch && escolaCodigoMatch && anoFormacaoMatch;
      });
    }

    return alunos.filter(
      (a) =>
        a.name.toLowerCase().includes(t) ||
        a.codigo.toLowerCase().includes(t) ||
        a.ano_formacao.toLowerCase().includes(t) ||
        getEscolaName(a.escola).toLowerCase().includes(t) ||
        getEscolaCodigo(a.escola).toLowerCase().includes(t)
    );
  }, [alunos, term, getEscolaName, getEscolaCodigo]);

  const handleExportSchoolPdf = () => {
    if (!schoolId) return;
    const schoolName = getEscolaName(schoolId);
    const alunosDaEscola = alunos.filter((a) => a.escola === schoolId);

    const doc = new jsPDF("landscape");

    // Cabeçalho do relatório
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Nome da Escola: ${schoolName}`, 14, 25);

    // Espaçamento inicial para a tabela de meses
    const finalY = 30;

    // Pagamentos mês a mês por aluno (Mês 1 = mês do primeiro pagamento do aluno; Mês N = +N-1)
    const monthsCount = 12;

    // Criar cabeçalhos dinâmicos baseados no primeiro pagamento de cada aluno
    const monthBody = alunosDaEscola.map((aluno) => {
      const alunoFinances = finances.filter((f) => f.alunoId === aluno.id);
      // ordenar por data e pegar o primeiro pagamento
      const first = alunoFinances
        .slice()
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )[0];

      const row: (string | number)[] = [aluno.name, aluno.class];
      if (!first) {
        // sem pagamentos: preencher com vazio
        for (let i = 0; i < monthsCount; i++) row.push("");
        return { row: row as (string | number)[], firstDate: null };
      }

      const firstDate = new Date(first.createdAt);
      for (let i = 0; i < monthsCount; i++) {
        const ref = addMonths(firstDate, i);
        const refMonth = ref.getMonth();
        const refYear = ref.getFullYear();

        let monthTotal = 0;

        // Processar pagamentos regulares deste mês
        const monthPayments = alunoFinances.filter((f) => {
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
        const boletos = alunoFinances.filter((f) => f.method === "bank_slip");
        boletos.forEach((boleto) => {
          // Usar a data do primeiro vencimento se disponível, senão usar a data de criação
          let boletoDate: Date;
          if (boleto.firstDueDate) {
            // Corrigir problema de timezone - criar data no timezone local
            const [year, month, day] = boleto.firstDueDate
              .split("-")
              .map(Number);
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

        row.push(
          monthTotal > 0 ? currency(monthTotal).replace("R$", "").trim() : ""
        );
      }
      return { row: row as (string | number)[], firstDate };
    });

    // Criar cabeçalho baseado no primeiro aluno com pagamentos
    const firstAlunoWithPayments = monthBody.find(
      (item) => item.firstDate !== null
    );
    let monthHeader = ["Aluno", "Classe"];

    if (firstAlunoWithPayments?.firstDate) {
      const firstDate = firstAlunoWithPayments.firstDate;
      for (let i = 0; i < monthsCount; i++) {
        const monthDate = addMonths(firstDate, i);
        const monthName = format(monthDate, "MMM/yy", { locale: ptBR });
        monthHeader.push(monthName);
      }
    } else {
      // Fallback se não houver pagamentos
      monthHeader = [
        "Aluno",
        "Classe",
        ...Array.from({ length: monthsCount }, (_, i) => `Mês ${i + 1}`),
      ];
    }

    // Extrair apenas as rows para o body
    const monthBodyRows = monthBody.map((item) => item.row);

    // Calcular totais mensais
    const monthlyTotals = Array(monthsCount).fill(0);
    monthBodyRows.forEach((row) => {
      for (let i = 0; i < monthsCount; i++) {
        const value = row[i + 2]; // +2 porque os primeiros são "Aluno" e "Classe"
        if (value && value !== "") {
          // Remover formatação de moeda e converter para número
          const numericValue = parseFloat(
            value
              .toString()
              .replace(/[^\d,]/g, "")
              .replace(",", ".")
          );
          if (!isNaN(numericValue)) {
            monthlyTotals[i] += numericValue;
          }
        }
      }
    });

    // Criar linha de total
    const totalRow = [
      "TOTAL",
      "",
      ...monthlyTotals.map((total) =>
        total > 0 ? currency(total).replace("R$", "").trim() : ""
      ),
    ];

    // Adicionar linha de total ao body
    const bodyWithTotal = [...monthBodyRows, totalRow];

    const startY = finalY;
    autoTable(doc, {
      startY: startY + 5,
      head: [monthHeader],
      body: bodyWithTotal,
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 40, right: 14, bottom: 20, left: 14 },
      didParseCell: function (data) {
        // Aplicar negrito na última linha (total)
        if (data.row.index === monthBodyRows.length) {
          data.cell.styles.fontStyle = "bold";
        }
      },
    });

    doc.save(`relatorio-escola-${schoolName}.pdf`);
  };

  const handleExportClassPdf = () => {
    if (!selectedClass) return;
    const alunosDaClasse = alunos.filter((a) => a.class === selectedClass);

    const doc = new jsPDF("landscape");

    // Cabeçalho do relatório
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Classe: ${selectedClass}`, 14, 25);

    // Espaçamento inicial para a tabela de meses
    const finalY = 30;

    // Pagamentos mês a mês por aluno (Mês 1 = mês do primeiro pagamento do aluno; Mês N = +N-1)
    const monthsCount = 12;

    // Criar cabeçalhos dinâmicos baseados no primeiro pagamento de cada aluno
    const monthBody = alunosDaClasse.map((aluno) => {
      const alunoFinances = finances.filter((f) => f.alunoId === aluno.id);
      // ordenar por data e pegar o primeiro pagamento
      const first = alunoFinances
        .slice()
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )[0];

      const row: (string | number)[] = [
        aluno.name,
        getEscolaName(aluno.escola),
      ];
      if (!first) {
        // sem pagamentos: preencher com vazio
        for (let i = 0; i < monthsCount; i++) row.push("");
        return { row: row as (string | number)[], firstDate: null };
      }

      const firstDate = new Date(first.createdAt);
      for (let i = 0; i < monthsCount; i++) {
        const ref = addMonths(firstDate, i);
        const refMonth = ref.getMonth();
        const refYear = ref.getFullYear();

        let monthTotal = 0;

        // Processar pagamentos regulares deste mês
        const monthPayments = alunoFinances.filter((f) => {
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
        const boletos = alunoFinances.filter((f) => f.method === "bank_slip");
        boletos.forEach((boleto) => {
          // Usar a data do primeiro vencimento se disponível, senão usar a data de criação
          let boletoDate: Date;
          if (boleto.firstDueDate) {
            // Corrigir problema de timezone - criar data no timezone local
            const [year, month, day] = boleto.firstDueDate
              .split("-")
              .map(Number);
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

        row.push(
          monthTotal > 0 ? currency(monthTotal).replace("R$", "").trim() : ""
        );
      }
      return { row: row as (string | number)[], firstDate };
    });

    // Criar cabeçalho baseado no primeiro aluno com pagamentos
    const firstAlunoWithPayments = monthBody.find(
      (item) => item.firstDate !== null
    );
    let monthHeader = ["Aluno", "Escola"];

    if (firstAlunoWithPayments?.firstDate) {
      const firstDate = firstAlunoWithPayments.firstDate;
      for (let i = 0; i < monthsCount; i++) {
        const monthDate = addMonths(firstDate, i);
        const monthName = format(monthDate, "MMM/yy", { locale: ptBR });
        monthHeader.push(monthName);
      }
    } else {
      // Fallback se não houver pagamentos
      monthHeader = [
        "Aluno",
        "Escola",
        ...Array.from({ length: monthsCount }, (_, i) => `Mês ${i + 1}`),
      ];
    }

    // Extrair apenas as rows para o body
    const monthBodyRows = monthBody.map((item) => item.row);

    // Calcular totais mensais
    const monthlyTotals = Array(monthsCount).fill(0);
    monthBodyRows.forEach((row) => {
      for (let i = 0; i < monthsCount; i++) {
        const value = row[i + 2]; // +2 porque os primeiros são "Aluno" e "Escola"
        if (value && value !== "") {
          // Remover formatação de moeda e converter para número
          const numericValue = parseFloat(
            value
              .toString()
              .replace(/[^\d,]/g, "")
              .replace(",", ".")
          );
          if (!isNaN(numericValue)) {
            monthlyTotals[i] += numericValue;
          }
        }
      }
    });

    // Criar linha de total
    const totalRow = [
      "TOTAL",
      "",
      ...monthlyTotals.map((total) =>
        total > 0 ? currency(total).replace("R$", "").trim() : ""
      ),
    ];

    // Adicionar linha de total ao body
    const bodyWithTotal = [...monthBodyRows, totalRow];

    const startY = finalY;
    autoTable(doc, {
      startY: startY + 5,
      head: [monthHeader],
      body: bodyWithTotal,
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 40, right: 14, bottom: 20, left: 14 },
      didParseCell: function (data) {
        // Aplicar negrito na última linha (total)
        if (data.row.index === monthBodyRows.length) {
          data.cell.styles.fontStyle = "bold";
        }
      },
    });

    doc.save(`relatorio-classe-${selectedClass}.pdf`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por aluno ou código (ex: 001/100/2024)"
            className="max-w-sm"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <Select value={schoolId} onValueChange={setSchoolId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Selecionar escola" />
              </SelectTrigger>
              <SelectContent>
                {escolas.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.codigo} - {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleExportSchoolPdf} disabled={!schoolId}>
              Exportar PDF da Escola
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Selecionar classe" />
              </SelectTrigger>
              <SelectContent>
                {uniqueClasses.map((classe) => (
                  <SelectItem key={classe} value={classe}>
                    {classe}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleExportClassPdf} disabled={!selectedClass}>
              Exportar PDF da Classe
            </Button>
          </div>
        </div>
      </div>
      <ReportsTable
        alunos={filteredAlunos}
        escolas={escolas}
        finances={finances}
      />
    </div>
  );
};

export default ReportsWithSearch;

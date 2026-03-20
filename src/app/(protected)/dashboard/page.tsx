import { count, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import {
  alunoExtrasTable,
  alunosTable,
  escolasTable,
  financesTable,
  representantesTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";

import { MonthYearFilter } from "./components/month-year-filter";
import { PaymentMethodChart } from "./components/payment-method-chart";
import { RevenueChart } from "./components/revenue-chart";
import { StatsCard } from "./components/stats-card";
import { UpcomingPaymentsAlert } from "./components/upcoming-payments-alert";

function getRevenueFromFinance(
  finance: typeof financesTable.$inferSelect
): number {
  const valueTotal = parseFloat(finance.valueTotal || "0");
  if (
    (finance.method !== "bank_slip" && finance.method !== "creditparc") ||
    !finance.bank_slip ||
    !finance.parcelasPagas
  ) {
    return valueTotal;
  }
  try {
    const parcelasPagas = JSON.parse(finance.parcelasPagas) as Record<
      string,
      boolean
    >;
    const totalParcelas = parseInt(finance.bank_slip, 10);
    const parcelasPagasCount = Object.values(parcelasPagas).filter(
      (pago) => pago === true
    ).length;
    if (totalParcelas > 0 && parcelasPagasCount > 0) {
      return (valueTotal / totalParcelas) * parcelasPagasCount;
    }
  } catch {
    return valueTotal;
  }
  return valueTotal;
}

type DashboardSearchParams = {
  month?: string;
  year?: string;
};

function toMonthKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function monthKeyToLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map((v) => Number(v));
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
}

function isDateInRange(date: Date, start: Date, end: Date) {
  return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
}

const DashboardPage = async ({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>;
}) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/login");
  }

  const sp = await searchParams;

  let alunosCount = 0;
  let escolasCount = 0;
  let representantesCount = 0;
  let alunosComAlbum = 0;
  let alunosComColacao = 0;
  let alunosComBaile = 0;
  let finances: typeof financesTable.$inferSelect[] = [];
  let extras: typeof alunoExtrasTable.$inferSelect[] = [];

  try {
    const [
      alunosCountRow,
      escolasCountRow,
      representantesCountRow,
      albumRow,
      colacaoRow,
      baileRow,
      financesData,
      extrasData,
    ] =
      await Promise.all([
        db.select({ value: count() }).from(alunosTable).then((r) => r[0]),
        db.select({ value: count() }).from(escolasTable).then((r) => r[0]),
        db.select({ value: count() }).from(representantesTable).then((r) => r[0]),
        db
          .select({ value: count() })
          .from(alunosTable)
          .where(eq(alunosTable.album, true))
          .then((r) => r[0]),
        db
          .select({ value: count() })
          .from(alunosTable)
          .where(eq(alunosTable.colacao, true))
          .then((r) => r[0]),
        db
          .select({ value: count() })
          .from(alunosTable)
          .where(eq(alunosTable.baile, true))
          .then((r) => r[0]),
        db.select().from(financesTable),
        db
          .select()
          .from(alunoExtrasTable)
          .where(eq(alunoExtrasTable.paid, true)),
      ]);

    alunosCount = Number(alunosCountRow?.value ?? 0);
    escolasCount = Number(escolasCountRow?.value ?? 0);
    representantesCount = Number(representantesCountRow?.value ?? 0);
    alunosComAlbum = Number(albumRow?.value ?? 0);
    alunosComColacao = Number(colacaoRow?.value ?? 0);
    alunosComBaile = Number(baileRow?.value ?? 0);
    finances = financesData;
    extras = extrasData;
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
  }

  const financeMonthKeys = finances.map((f) =>
    toMonthKey(new Date(f.createdAt)),
  );
  const extrasMonthKeys = extras
    .map((e) => {
      const date = (e.paidAt ? new Date(e.paidAt) : null) ?? new Date(e.createdAt);
      return toMonthKey(date);
    })
    .filter(Boolean);

  const uniqueMonthKeys = Array.from(new Set([...financeMonthKeys, ...extrasMonthKeys]));
  uniqueMonthKeys.sort((a, b) => {
    const [ay, am] = a.split("-").map(Number);
    const [by, bm] = b.split("-").map(Number);
    return new Date(ay, am - 1, 1).getTime() - new Date(by, bm - 1, 1).getTime();
  });

  const latestMonthKey = uniqueMonthKeys[uniqueMonthKeys.length - 1];
  const now = new Date();

  const selectedYearFromParams = Number(sp.year);
  const selectedMonthFromParams = Number(sp.month);

  const defaultDate = latestMonthKey
    ? (() => {
        const [y, m] = latestMonthKey.split("-").map(Number);
        return new Date(y, m - 1, 1);
      })()
    : now;

  const selectedYear =
    Number.isFinite(selectedYearFromParams) && selectedYearFromParams > 0
      ? selectedYearFromParams
      : defaultDate.getFullYear();

  const selectedMonth =
    Number.isFinite(selectedMonthFromParams) &&
    selectedMonthFromParams >= 1 &&
    selectedMonthFromParams <= 12
      ? selectedMonthFromParams
      : defaultDate.getMonth() + 1;

  const availableYears = Array.from(
    new Set(uniqueMonthKeys.map((key) => Number(key.split("-")[0]))),
  ).sort((a, b) => b - a);

  const windowEnd = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999);
  const windowStart = new Date(selectedYear, selectedMonth - 1, 1);
  windowStart.setMonth(windowStart.getMonth() - 5);
  windowStart.setHours(0, 0, 0, 0);

  const selectedMonthStart = new Date(selectedYear, selectedMonth - 1, 1, 0, 0, 0, 0);
  const selectedMonthEnd = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999);

  const monthWindowKeys = Array.from({ length: 6 }, (_, idx) => {
    const d = new Date(
      windowStart.getFullYear(),
      windowStart.getMonth() + idx,
      1,
    );
    return toMonthKey(d);
  });

  const filteredFinances = finances.filter((finance) => {
    const date = new Date(finance.createdAt);
    return isDateInRange(date, windowStart, windowEnd);
  });

  const filteredFinancesMonth = finances.filter((finance) => {
    const date = new Date(finance.createdAt);
    return isDateInRange(date, selectedMonthStart, selectedMonthEnd);
  });

  const filteredExtrasPaidMonth = extras.filter((extra) => {
    if (!extra.paidAt) return false;
    const date = new Date(extra.paidAt);
    return isDateInRange(date, selectedMonthStart, selectedMonthEnd);
  });

  const totalRevenue = filteredFinancesMonth.reduce(
    (acc, finance) => acc + getRevenueFromFinance(finance),
    0,
  );

  const totalExtrasPaid = filteredExtrasPaidMonth.reduce((acc, extra) => {
    const value = parseFloat(extra.total || "0");
    if (Number.isNaN(value)) return acc;
    return acc + value;
  }, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const revenueByMonth = monthWindowKeys.map((key) => {
    const revenue = filteredFinances.reduce((acc, finance) => {
      const monthKey = toMonthKey(new Date(finance.createdAt));
      if (monthKey !== key) return acc;
      return acc + getRevenueFromFinance(finance);
    }, 0);

    return {
      month: monthKeyToLabel(key),
      revenue: Math.round(revenue),
    };
  });

  const revenueByMethodMap = new Map<string, number>();
  const methodNames: Record<string, string> = {
    pix: "PIX",
    debit: "Débito",
    creditvista: "Crédito à Vista",
    creditparc: "Crédito Parcelado",
    bank_slip: "Boleto",
  };

  filteredFinances.forEach((finance) => {
    const revenue = getRevenueFromFinance(finance);
    const methodName = methodNames[finance.method] || finance.method;
    const current = revenueByMethodMap.get(methodName) || 0;
    revenueByMethodMap.set(methodName, current + revenue);
  });

  const revenueByMethod = Array.from(revenueByMethodMap.entries())
    .map(([name, value]) => ({
      name,
      value: Math.round(value),
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Dashboard</PageTitle>
          <PageDescription>
            Visão geral do sistema e estatísticas principais
          </PageDescription>
        </PageHeaderContent>
        <div className="w-full sm:w-auto">
          <MonthYearFilter
            years={availableYears}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
          />
        </div>
      </PageHeader>
      <PageContent>
        <UpcomingPaymentsAlert finances={filteredFinances} />
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-6">
          <StatsCard
            title="Total de Alunos"
            value={alunosCount}
            description="Alunos cadastrados no sistema"
            iconName="GraduationCap"
            gradient="from-blue-500/10 to-cyan-500/10"
          />
          <StatsCard
            title="Total de Escolas"
            value={escolasCount}
            description="Escolas parceiras"
            iconName="School"
            gradient="from-purple-500/10 to-pink-500/10"
          />
          <StatsCard
            title="Representantes"
            value={representantesCount}
            description="Representantes ativos"
            iconName="UserPen"
            gradient="from-green-500/10 to-emerald-500/10"
          />
          <StatsCard
            title="Receita Total"
            value={formatCurrency(totalRevenue)}
            description="Total arrecadado"
            iconName="CircleDollarSign"
            gradient="from-orange-500/10 to-red-500/10"
          />
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-4">
          <StatsCard
            title="Alunos com Álbum"
            value={alunosComAlbum}
            description={`${((alunosComAlbum / alunosCount) * 100 || 0).toFixed(1)}% do total`}
            iconName="BookImage"
            gradient="from-indigo-500/10 to-blue-500/10"
          />
          <StatsCard
            title="Alunos com Colação"
            value={alunosComColacao}
            description={`${((alunosComColacao / alunosCount) * 100 || 0).toFixed(1)}% do total`}
            iconName="TrendingUp"
            gradient="from-teal-500/10 to-cyan-500/10"
          />
          <StatsCard
            title="Alunos com Baile"
            value={alunosComBaile}
            description={`${((alunosComBaile / alunosCount) * 100 || 0).toFixed(1)}% do total`}
            iconName="TrendingUp"
            gradient="from-rose-500/10 to-pink-500/10"
          />
          <StatsCard
            title="Valor de Itens Extras"
            value={formatCurrency(totalExtrasPaid)}
            description="Total pago em extras"
            iconName="CircleDollarSign"
            gradient="from-amber-500/10 to-orange-500/10"
          />
        </div>

        {revenueByMonth.length > 0 && (
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Receita por Mês</CardTitle>
                <CardDescription>
                  Receita arrecadada nos últimos 6 meses até{" "}
                  {monthKeyToLabel(monthWindowKeys[monthWindowKeys.length - 1])}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueChart data={revenueByMonth} />
              </CardContent>
            </Card>

            {revenueByMethod.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Receita por Método de Pagamento</CardTitle>
                  <CardDescription>
                    Distribuição da receita por forma de pagamento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PaymentMethodChart data={revenueByMethod} />
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </PageContent>
    </PageContainer>
  );
};

export default DashboardPage;

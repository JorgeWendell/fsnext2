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

const DashboardPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/login");
  }

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

  const totalRevenue = finances.reduce(
    (acc, finance) => acc + getRevenueFromFinance(finance),
    0
  );

  const totalExtrasPaid = extras.reduce((acc, extra) => {
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

  const calculateRevenueByMonth = () => {
    const monthMap = new Map<string, number>();
    finances.forEach((finance) => {
      const date = new Date(finance.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const revenue = getRevenueFromFinance(finance);
      const current = monthMap.get(monthKey) || 0;
      monthMap.set(monthKey, current + revenue);
    });
    return Array.from(monthMap.entries())
      .map(([key, revenue]) => {
        const [year, month] = key.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return {
          month: date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" }),
          revenue: Math.round(revenue),
        };
      })
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(-6);
  };

  const calculateRevenueByMethod = () => {
    const methodMap = new Map<string, number>();
    const methodNames: Record<string, string> = {
      pix: "PIX",
      debit: "Débito",
      creditvista: "Crédito à Vista",
      creditparc: "Crédito Parcelado",
      bank_slip: "Boleto",
    };
    finances.forEach((finance) => {
      const revenue = getRevenueFromFinance(finance);
      const methodName = methodNames[finance.method] || finance.method;
      const current = methodMap.get(methodName) || 0;
      methodMap.set(methodName, current + revenue);
    });
    return Array.from(methodMap.entries())
      .map(([name, value]) => ({
        name,
        value: Math.round(value),
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  };

  const revenueByMonth = calculateRevenueByMonth();
  const revenueByMethod = calculateRevenueByMethod();

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Dashboard</PageTitle>
          <PageDescription>
            Visão geral do sistema e estatísticas principais
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <UpcomingPaymentsAlert finances={finances} />
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
                  Receita arrecadada nos últimos 6 meses
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

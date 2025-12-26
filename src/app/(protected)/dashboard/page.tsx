import { headers } from "next/headers";
import { redirect } from "next/navigation";

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
  alunosTable,
  escolasTable,
  financesTable,
  representantesTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";

import { StatsCard } from "./components/stats-card";

const DashboardPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/authentication");
  }

  let alunos: typeof alunosTable.$inferSelect[] = [];
  let escolas: typeof escolasTable.$inferSelect[] = [];
  let representantes: typeof representantesTable.$inferSelect[] = [];
  let finances: typeof financesTable.$inferSelect[] = [];

  try {
    alunos = await db.query.alunosTable.findMany();
    escolas = await db.select().from(escolasTable);
    representantes = await db.select().from(representantesTable);
    finances = await db.select().from(financesTable);
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
  }

  const totalRevenue = finances.reduce((acc, finance) => {
    const valueTotal = parseFloat(finance.valueTotal || "0");
    
    if (
      (finance.method === "bank_slip" || finance.method === "creditparc") &&
      finance.bank_slip &&
      finance.parcelasPagas
    ) {
      try {
        const parcelasPagas = JSON.parse(finance.parcelasPagas);
        const totalParcelas = parseInt(finance.bank_slip, 10);
        const parcelasPagasCount = Object.values(parcelasPagas).filter(
          (pago) => pago === true
        ).length;
        
        if (totalParcelas > 0 && parcelasPagasCount > 0) {
          const valorPorParcela = valueTotal / totalParcelas;
          return acc + valorPorParcela * parcelasPagasCount;
        }
      } catch (error) {
        console.error("Erro ao processar parcelas pagas:", error);
      }
    }
    
    return acc + valueTotal;
  }, 0);

  const alunosComAlbum = alunos.filter((aluno) => aluno.album).length;
  const alunosComColacao = alunos.filter((aluno) => aluno.colacao).length;
  const alunosComBaile = alunos.filter((aluno) => aluno.baile).length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total de Alunos"
            value={alunos.length}
            description="Alunos cadastrados no sistema"
            iconName="GraduationCap"
            gradient="from-blue-500/10 to-cyan-500/10"
          />
          <StatsCard
            title="Total de Escolas"
            value={escolas.length}
            description="Escolas parceiras"
            iconName="School"
            gradient="from-purple-500/10 to-pink-500/10"
          />
          <StatsCard
            title="Representantes"
            value={representantes.length}
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
          <StatsCard
            title="Alunos com Álbum"
            value={alunosComAlbum}
            description={`${((alunosComAlbum / alunos.length) * 100 || 0).toFixed(1)}% do total`}
            iconName="BookImage"
            gradient="from-indigo-500/10 to-blue-500/10"
          />
          <StatsCard
            title="Alunos com Colação"
            value={alunosComColacao}
            description={`${((alunosComColacao / alunos.length) * 100 || 0).toFixed(1)}% do total`}
            iconName="TrendingUp"
            gradient="from-teal-500/10 to-cyan-500/10"
          />
          <StatsCard
            title="Alunos com Baile"
            value={alunosComBaile}
            description={`${((alunosComBaile / alunos.length) * 100 || 0).toFixed(1)}% do total`}
            iconName="TrendingUp"
            gradient="from-rose-500/10 to-pink-500/10"
          />
          <StatsCard
            title="Transações"
            value={finances.length}
            description="Total de pagamentos registrados"
            iconName="CircleDollarSign"
            gradient="from-amber-500/10 to-orange-500/10"
          />
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default DashboardPage;

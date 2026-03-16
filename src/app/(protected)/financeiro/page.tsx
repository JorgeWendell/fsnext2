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
  alunoExtrasTable,
  alunosTable,
  escolasTable,
  financesTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";

import FinanceiroWrapper from "./components/financeiro-wrapper";

const FinanceiroPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/login");
  }

  let alunos: typeof alunosTable.$inferSelect[] = [];
  let escolas: typeof escolasTable.$inferSelect[] = [];
  let finances: typeof financesTable.$inferSelect[] = [];
  let extras: typeof alunoExtrasTable.$inferSelect[] = [];
  
  try {
    [escolas, alunos, finances, extras] = await Promise.all([
      db.select().from(escolasTable),
      db.query.alunosTable.findMany({
        where: (aluno, { eq: eqField }) => eqField(aluno.active, true),
      }),
      db.select().from(financesTable),
      db.select().from(alunoExtrasTable),
    ]);
    if (!Array.isArray(escolas)) escolas = [];
    if (!Array.isArray(alunos)) alunos = [];
    if (!Array.isArray(finances)) finances = [];
    if (!Array.isArray(extras)) extras = [];
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    escolas = [];
    alunos = [];
    finances = [];
    extras = [];
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Financeiro</PageTitle>
          <PageDescription>Gerencie os dados financeiros dos alunos</PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <FinanceiroWrapper 
          alunos={alunos} 
          escolas={escolas} 
          finances={finances}
          extras={extras}
        />
      </PageContent>
    </PageContainer>
  );
};

export default FinanceiroPage;

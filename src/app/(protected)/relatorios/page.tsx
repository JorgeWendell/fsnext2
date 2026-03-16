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

import ReportsWrapper from "./components/reports-wrapper";

const ReportsPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  let alunos: typeof alunosTable.$inferSelect[] = [];
  let escolas: typeof escolasTable.$inferSelect[] = [];
  let finances: typeof financesTable.$inferSelect[] = [];
  let extras: typeof alunoExtrasTable.$inferSelect[] = [];

  try {
    [escolas, alunos, finances, extras] = await Promise.all([
      db.select().from(escolasTable),
      db.query.alunosTable.findMany({
        where: (aluno, { eq }) => eq(aluno.active, true),
      }),
      db.select().from(financesTable),
      db.select().from(alunoExtrasTable),
    ]);
  } catch {
    alunos = [];
    escolas = [];
    finances = [];
    extras = [];
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Relatórios</PageTitle>
          <PageDescription>Analise e exporte relatórios financeiros</PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <ReportsWrapper
          alunos={alunos}
          escolas={escolas}
          finances={finances}
          extras={extras}
        />
      </PageContent>
    </PageContainer>
  );
};

export default ReportsPage;

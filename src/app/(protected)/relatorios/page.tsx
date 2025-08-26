import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { PageContainer, PageContent, PageDescription, PageHeader, PageHeaderContent, PageTitle } from "@/components/ui/page-container";
import { db } from "@/db";
import { alunosTable, escolasTable, financesTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import ReportsWrapper from "./components/reports-wrapper";

const ReportsPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/authentication");

  let alunos: typeof alunosTable.$inferSelect[] = [];
  let escolas: typeof escolasTable.$inferSelect[] = [];
  let finances: typeof financesTable.$inferSelect[] = [];

  try {
    escolas = await db.select().from(escolasTable);
    alunos = await db.query.alunosTable.findMany();
    finances = await db.select().from(financesTable);
  } catch {
    alunos = [];
    escolas = [];
    finances = [];
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
        <ReportsWrapper alunos={alunos} escolas={escolas} finances={finances} />
      </PageContent>
    </PageContainer>
  );
};

export default ReportsPage;

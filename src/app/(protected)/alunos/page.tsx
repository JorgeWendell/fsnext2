import { and, eq, lt } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { alunoExtrasTable, alunosTable, escolasTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import AddAlunoButton from "./components/add-aluno-button";
import AlunosWithSearch from "./components/alunos-with-search";

const AlunosPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/login");
  }

  let alunos: typeof alunosTable.$inferSelect[] = [];
  let escolas: typeof escolasTable.$inferSelect[] = [];
  let extras: typeof alunoExtrasTable.$inferSelect[] = [];

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    await db
      .delete(alunosTable)
      .where(
        and(
          eq(alunosTable.active, false),
          lt(alunosTable.updateAt, thirtyDaysAgo),
        ),
      );

    [alunos, escolas, extras] = await Promise.all([
      db.query.alunosTable.findMany(),
      db.select().from(escolasTable),
      db
        .select()
        .from(alunoExtrasTable)
        .where(eq(alunoExtrasTable.paid, true)),
    ]);
    if (!Array.isArray(escolas)) escolas = [];
    if (!Array.isArray(extras)) extras = [];
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    alunos = [];
    escolas = [];
    extras = [];
  }

  const escolasArray = Array.isArray(escolas) ? escolas : [];
 
  
 

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Alunos</PageTitle>
          <PageDescription>Gerencie seus alunos</PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddAlunoButton escolas={escolasArray} />
        </PageActions>
      </PageHeader>
      <PageContent>
        <AlunosWithSearch alunos={alunos} escolas={escolasArray} extras={extras} />
      </PageContent>
    </PageContainer>
  );
};

export default AlunosPage;

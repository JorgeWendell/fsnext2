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
import { alunosTable,escolasTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import AddAlunoButton from "./components/add-aluno-button";
import AlunosWithSearch from "./components/alunos-with-search";

const AlunosPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/authentication");
  }

  let alunos: typeof alunosTable.$inferSelect[] = [];
  let escolas: typeof escolasTable.$inferSelect[] = [];

  try {
    [alunos, escolas] = await Promise.all([
      db.query.alunosTable.findMany(),
      db.select().from(escolasTable),
    ]);
    if (!Array.isArray(escolas)) escolas = [];
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    alunos = [];
    escolas = [];
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
          <AddAlunoButton escolas={escolasArray} alunos={alunos} />
        </PageActions>
      </PageHeader>
      <PageContent>
        <AlunosWithSearch alunos={alunos} escolas={escolasArray} />
      </PageContent>
    </PageContainer>
  );
};

export default AlunosPage;

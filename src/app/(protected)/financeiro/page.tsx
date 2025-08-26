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
import { alunosTable, escolasTable, financesTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import FinanceiroWrapper from "./components/financeiro-wrapper";

const FinanceiroPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/authentication");
  }

  let alunos: typeof alunosTable.$inferSelect[] = [];
  let escolas: typeof escolasTable.$inferSelect[] = [];
  let finances: typeof financesTable.$inferSelect[] = [];
  
  try {
    // Buscar dados do banco
    escolas = await db.select().from(escolasTable);
    alunos = await db.query.alunosTable.findMany();
    finances = await db.select().from(financesTable);
    
    // Garantir que os arrays sejam válidos
    if (!Array.isArray(escolas)) {
      escolas = [];
    }
    if (!Array.isArray(alunos)) {
      alunos = [];
    }
    if (!Array.isArray(finances)) {
      finances = [];
    }
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    escolas = [];
    alunos = [];
    finances = [];
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
        />
      </PageContent>
    </PageContainer>
  );
};

export default FinanceiroPage;

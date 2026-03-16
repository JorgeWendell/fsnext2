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
import { escolasTable, representantesTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import AddEscolaButton from "./components/add-escola-button";
import EscolasWithSearch from "./components/escolas-with-search";

const EscolasPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/login");
  }

  let escolas: typeof escolasTable.$inferSelect[] = [];
  let representantes: typeof representantesTable.$inferSelect[] = [];

  try {
    [escolas, representantes] = await Promise.all([
      db.query.escolasTable.findMany(),
      db.select().from(representantesTable),
    ]);
    if (!Array.isArray(representantes)) representantes = [];
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    escolas = [];
    representantes = [];
  }

  const representantesArray = Array.isArray(representantes)
    ? representantes
    : [];
 
  
 

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Escolas</PageTitle>
          <PageDescription>Gerencie suas escolas</PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddEscolaButton representantes={representantesArray} escolas={escolas} />
        </PageActions>
      </PageHeader>
      <PageContent>
        <EscolasWithSearch
          escolas={escolas}
          representantes={representantesArray}
        />
      </PageContent>
    </PageContainer>
  );
};

export default EscolasPage;

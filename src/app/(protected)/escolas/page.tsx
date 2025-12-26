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
    redirect("/authentication");
  }

  let escolas: typeof escolasTable.$inferSelect[] = [];
  let representantes: typeof representantesTable.$inferSelect[] = [];
  
  try {
    // Verificar se a conexão está funcionando
    console.log("Testando conexão com banco...");
    console.log("DATABASE_URL existe:", !!process.env.DATABASE_URL);
    
    // Teste simples primeiro
    representantes = await db.select().from(representantesTable);
    
    
    if (!representantes || representantes.length === 0) {
      console.log("Nenhum representante encontrado no banco");
      representantes = [];
    } else {
      console.log("Representantes encontrados:", representantes.length);
    }
    
    escolas = await db.query.escolasTable.findMany();
    representantes = await db.select().from(representantesTable);

    
    
        // Garantir que representantes seja sempre um array
    if (!Array.isArray(representantes)) {
      console.log("Representantes não é um array, convertendo...");
      representantes = [];
    }
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    representantes = [];
    escolas = [];
  }


  
  // Garantir que representantes seja sempre um array válido
  const representantesArray = Array.isArray(representantes) ? representantes : [];
 
  
 

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Escolas</PageTitle>
          <PageDescription>Gerencie suas escolas</PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddEscolaButton representantes={representantesArray} />
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

import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { auth } from "@/lib/auth";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { representantesTable } from "@/db/schema";

import EscolaCard from "./components/escola-card";
import AddEscolaButton from "./components/add-escola-button";

const EscolasPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/authentication");
  }

  let escolas, representantes;
  
  try {
    // Verificar se a conexão está funcionando
   
    
    // Teste simples primeiro
    representantes = await db.select().from(representantesTable);
    
    
    if (!representantes || representantes.length === 0) {
      console.log("Nenhum representante encontrado no banco");
      representantes = [];
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
        <div className="grid grid-cols-5 gap-6">
          {escolas?.map((escola) => (
            <EscolaCard
              key={escola.id}
              escola={escola}
              representantes={representantesArray}
            />
          ))}
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default EscolasPage;

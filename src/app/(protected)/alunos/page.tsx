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
    // Verificar se a conexão está funcionando
    console.log("Testando conexão com banco...");
    console.log("DATABASE_URL existe:", !!process.env.DATABASE_URL);
    
    // Teste simples primeiro
    escolas = await db.select().from(escolasTable);
    
    
    if (!escolas || escolas.length === 0) {
      console.log("Nenhuma escola encontrada no banco");
      escolas = [];
    } else {
      console.log("Escolas encontradas:", escolas.length);
    }
    
    alunos = await db.query.alunosTable.findMany();
    escolas = await db.select().from(escolasTable);

    
    
        // Garantir que escolas seja sempre um array
    if (!Array.isArray(escolas)) {
      console.log("Escolas não é um array, convertendo...");
      escolas = [];
    }
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    escolas = [];
    alunos = [];
  }


  
  // Garantir que escolas seja sempre um array válido
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
        <AlunosWithSearch alunos={alunos} escolas={escolasArray} />
      </PageContent>
    </PageContainer>
  );
};

export default AlunosPage;

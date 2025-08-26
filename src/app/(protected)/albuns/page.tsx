import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { PageContainer, PageContent, PageDescription, PageHeader, PageHeaderContent, PageTitle } from "@/components/ui/page-container";
import { db } from "@/db";
import { alunosTable, escolasTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import AlbunsWrapper from "./components/albuns-wrapper";

const AlbunsPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/authentication");

  let alunos: typeof alunosTable.$inferSelect[] = [];
  let escolas: typeof escolasTable.$inferSelect[] = [];

  try {
    escolas = await db.select().from(escolasTable);
    const allAlunos = await db.query.alunosTable.findMany();
         alunos = allAlunos.filter((a: typeof alunosTable.$inferSelect & { album?: boolean }) => a.album === true);
  } catch {
    alunos = [];
    escolas = [];
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Álbuns</PageTitle>
          <PageDescription>Gerencie os pedidos de álbuns dos alunos</PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <AlbunsWrapper alunos={alunos} escolas={escolas} />
      </PageContent>
    </PageContainer>
  );
};

export default AlbunsPage;

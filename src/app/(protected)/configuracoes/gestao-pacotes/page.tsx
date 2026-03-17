/* eslint-disable simple-import-sort/imports */

import { db } from "@/db";
import { pacotesTable } from "@/db/schema";

import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";

import AddPacoteButton from "./components/add-pacote-button";
import PacotesTable from "./components/pacotes-table";

const GestaoPacotesPage = async () => {
  const pacotes = await db.select().from(pacotesTable);

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Gestão de Pacotes</PageTitle>
          <PageDescription>
            Configure e gerencie os pacotes padrão do sistema.
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddPacoteButton />
        </PageActions>
      </PageHeader>
      <PageContent>
        <PacotesTable pacotes={pacotes} />
      </PageContent>
    </PageContainer>
  );
};

export default GestaoPacotesPage;


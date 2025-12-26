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
import { auth } from "@/lib/auth";

import AddRepresentanteButton from "./components/add-repre-button";
import RepresentantesWithSearch from "./components/representantes-with-search";

const RepresentantesPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/authentication");
  }

  const representantes = await db.query.representantesTable.findMany({});

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Representantes</PageTitle>
          <PageDescription> Gerencie seus representantes</PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddRepresentanteButton />
        </PageActions>
      </PageHeader>
      <PageContent>
        <RepresentantesWithSearch representantes={representantes} />
      </PageContent>
    </PageContainer>
  );
};

export default RepresentantesPage;

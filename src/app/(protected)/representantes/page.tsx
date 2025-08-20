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
import AddRepresentanteButton from "./components/add-repre-button";

const RepresentantesPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/authentication");
  }
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
        <h1>Representantes</h1>
      </PageContent>
    </PageContainer>
  );
};

export default RepresentantesPage;

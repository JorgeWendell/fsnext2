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
import { db } from "@/db";
import RepresentanteCard from "./components/repre-card";

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
        <div className="grid grid-cols-5 gap-6">
          {representantes.map((representante) => (
            <RepresentanteCard
              key={representante.id}
              representante={representante}
            />
          ))}
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default RepresentantesPage;

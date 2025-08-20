import { Button } from "@/components/ui/button";
import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { Plus } from "lucide-react";

const RepresentantesPage = () => {
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Representantes</PageTitle>
          <PageDescription> Gerencie seus representantes</PageDescription>
        </PageHeaderContent>
        <PageActions>
          <Button>
            <Plus />
            Adicionar Representante
          </Button>
        </PageActions>
      </PageHeader>
      <PageContent>
        <h1>Representantes</h1>
      </PageContent>
    </PageContainer>
  );
};

export default RepresentantesPage;

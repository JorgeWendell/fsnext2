"use client";
import { useRouter } from "next/navigation";
import FinanceiroWithSearch from "./financeiro-with-search";
import { alunosTable, escolasTable, financesTable } from "@/db/schema";

interface FinanceiroWrapperProps {
  alunos: typeof alunosTable.$inferSelect[];
  escolas: typeof escolasTable.$inferSelect[];
  finances: typeof financesTable.$inferSelect[];
}

const FinanceiroWrapper = ({ alunos, escolas, finances }: FinanceiroWrapperProps) => {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <FinanceiroWithSearch 
      alunos={alunos} 
      escolas={escolas} 
      finances={finances} 
      onRefresh={handleRefresh}
    />
  );
};

export default FinanceiroWrapper;

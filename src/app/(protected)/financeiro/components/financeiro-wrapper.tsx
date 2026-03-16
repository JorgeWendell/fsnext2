"use client";
import { useRouter } from "next/navigation";

import {
  alunoExtrasTable,
  alunosTable,
  escolasTable,
  financesTable,
} from "@/db/schema";

import FinanceiroWithSearch from "./financeiro-with-search";

interface FinanceiroWrapperProps {
  alunos: typeof alunosTable.$inferSelect[];
  escolas: typeof escolasTable.$inferSelect[];
  finances: typeof financesTable.$inferSelect[];
  extras: typeof alunoExtrasTable.$inferSelect[];
}

const FinanceiroWrapper = ({
  alunos,
  escolas,
  finances,
  extras,
}: FinanceiroWrapperProps) => {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <FinanceiroWithSearch 
      alunos={alunos} 
      escolas={escolas} 
      finances={finances}
      extras={extras}
      onRefresh={handleRefresh}
    />
  );
};

export default FinanceiroWrapper;

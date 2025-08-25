"use client";
import { useRouter } from "next/navigation";
import ReportsWithSearch from "./reports-with-search";
import { alunosTable, escolasTable, financesTable } from "@/db/schema";

interface Props {
  alunos: typeof alunosTable.$inferSelect[];
  escolas: typeof escolasTable.$inferSelect[];
  finances: typeof financesTable.$inferSelect[];
}

const ReportsWrapper = ({ alunos, escolas, finances }: Props) => {
  const router = useRouter();
  const onRefresh = () => router.refresh();
  return (
    <ReportsWithSearch alunos={alunos} escolas={escolas} finances={finances} onRefresh={onRefresh} />
  );
};

export default ReportsWrapper;

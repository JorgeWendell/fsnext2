"use client";
// useRouter import removed as it's not being used

import { alunosTable, escolasTable, financesTable } from "@/db/schema";

import ReportsWithSearch from "./reports-with-search";

interface Props {
  alunos: typeof alunosTable.$inferSelect[];
  escolas: typeof escolasTable.$inferSelect[];
  finances: typeof financesTable.$inferSelect[];
}

const ReportsWrapper = ({ alunos, escolas, finances }: Props) => {
  // router removed as it's not being used
  // onRefresh removed as it's not being used
  return (
    <ReportsWithSearch alunos={alunos} escolas={escolas} finances={finances} />
  );
};

export default ReportsWrapper;

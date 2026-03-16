"use client";

import {
  alunoExtrasTable,
  alunosTable,
  escolasTable,
  financesTable,
} from "@/db/schema";

import ReportsWithSearch from "./reports-with-search";

interface Props {
  alunos: typeof alunosTable.$inferSelect[];
  escolas: typeof escolasTable.$inferSelect[];
  finances: typeof financesTable.$inferSelect[];
  extras: typeof alunoExtrasTable.$inferSelect[];
}

const ReportsWrapper = ({ alunos, escolas, finances, extras }: Props) => {
  return (
    <ReportsWithSearch
      alunos={alunos}
      escolas={escolas}
      finances={finances}
      extras={extras}
    />
  );
};

export default ReportsWrapper;

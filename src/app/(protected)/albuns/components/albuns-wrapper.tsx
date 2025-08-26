"use client";
// useRouter import removed as it's not being used

import { alunosTable, escolasTable } from "@/db/schema";

import AlbunsWithSearch from "./albuns-with-search";

interface Props {
  alunos: typeof alunosTable.$inferSelect[];
  escolas: typeof escolasTable.$inferSelect[];
}

const AlbunsWrapper = ({ alunos, escolas }: Props) => {
  // router removed as it's not being used
  // onRefresh removed as it's not being used
  return (
    <AlbunsWithSearch alunos={alunos} escolas={escolas} />
  );
};

export default AlbunsWrapper;

"use client";
import { useRouter } from "next/navigation";
import AlbunsWithSearch from "./albuns-with-search";
import { alunosTable, escolasTable } from "@/db/schema";

interface Props {
  alunos: typeof alunosTable.$inferSelect[];
  escolas: typeof escolasTable.$inferSelect[];
}

const AlbunsWrapper = ({ alunos, escolas }: Props) => {
  const router = useRouter();
  const onRefresh = () => router.refresh();
  return (
    <AlbunsWithSearch alunos={alunos} escolas={escolas} onRefresh={onRefresh} />
  );
};

export default AlbunsWrapper;

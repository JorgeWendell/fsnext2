"use client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { alunosTable } from "@/db/schema";

import AlbumEditDialog from "./album-edit-dialog";

interface Escola { id: string; name: string }

interface Props {
  alunos: typeof alunosTable.$inferSelect[];
  escolas: Escola[];
}

const currency = (v?: string) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL"}).format(parseFloat(v || '0') || 0);

const AlbunsTable = ({ alunos, escolas }: Props) => {
  const getEscolaName = (id: string) => escolas.find(e=>e.id===id)?.name ?? "-";
  const [openAlunoId, setOpenAlunoId] = useState<string | null>(null);

  // PDF removido a pedido

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Aluno</TableHead>
          <TableHead>Escola</TableHead>
          <TableHead>Classe</TableHead>
          <TableHead className="text-right">Valor do Álbum</TableHead>
          <TableHead className="text-right">Valor do Pendrive</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {alunos.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">Nenhum aluno com álbum ou pendrive</TableCell>
          </TableRow>
        ) : (
          alunos.map((aluno)=> (
            <TableRow key={aluno.id}>
              <TableCell className="font-medium">{aluno.name}</TableCell>
              <TableCell>{getEscolaName(aluno.escola)}</TableCell>
              <TableCell>{aluno.class}</TableCell>
              <TableCell className="text-right">
                {(aluno as typeof alunosTable.$inferSelect & { album?: boolean }).album
                  ? currency(
                      (aluno as typeof alunosTable.$inferSelect & { valor_album?: string })
                        .valor_album,
                    )
                  : "-"}
              </TableCell>
              <TableCell className="text-right">
                {(aluno as typeof alunosTable.$inferSelect & { pendrive?: boolean }).pendrive
                  ? currency(
                      (
                        aluno as typeof alunosTable.$inferSelect & {
                          valor_pendrive?: string;
                        }
                      ).valor_pendrive,
                    )
                  : "-"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Dialog open={openAlunoId === aluno.id} onOpenChange={(o)=>{ if (!o) setOpenAlunoId(null); }}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" onClick={()=>setOpenAlunoId(aluno.id)}>Editar</Button>
                    </DialogTrigger>
                    {openAlunoId === aluno.id && (
                      <AlbumEditDialog
                        aluno={
                          aluno as typeof alunosTable.$inferSelect & {
                            album?: boolean;
                            valor_album?: string;
                            pendrive?: boolean;
                            valor_pendrive?: string;
                          }
                        }
                        onClose={()=>setOpenAlunoId(null)}
                      />
                    )}
                  </Dialog>
                  {/* Botão PDF removido */}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default AlbunsTable;

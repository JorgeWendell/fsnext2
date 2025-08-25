"use client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { alunosTable } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import AlbumEditDialog from "./album-edit-dialog";
import jsPDF from "jspdf";
import { useState } from "react";

interface Escola { id: string; name: string }

interface Props {
  alunos: typeof alunosTable.$inferSelect[];
  escolas: Escola[];
}

const currency = (v?: string) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL"}).format(parseFloat(v || '0') || 0);

const AlbunsTable = ({ alunos, escolas }: Props) => {
  const getEscolaName = (id: string) => escolas.find(e=>e.id===id)?.name ?? "-";
  const [openAlunoId, setOpenAlunoId] = useState<string | null>(null);

  const handlePdf = (aluno: any) => {
    const doc = new jsPDF();
    doc.text("Recibo de Álbum", 14, 14);
    doc.text(`Aluno: ${aluno.name}`, 14, 24);
    doc.text(`Escola: ${getEscolaName(aluno.escola)}`, 14, 32);
    doc.text(`Classe: ${aluno.class}`, 14, 40);
    doc.text(`Valor do Álbum: ${currency(aluno.valor_album)}`, 14, 52);
    const date = new Date().toLocaleDateString('pt-BR');
    doc.text(`Data: ${date}`, 14, 60);
    doc.save(`recibo-album-${aluno.name}.pdf`);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Aluno</TableHead>
          <TableHead>Escola</TableHead>
          <TableHead>Classe</TableHead>
          <TableHead className="text-right">Valor do Álbum</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {alunos.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground">Nenhum aluno com álbum</TableCell>
          </TableRow>
        ) : (
          alunos.map((aluno)=> (
            <TableRow key={aluno.id}>
              <TableCell className="font-medium">{aluno.name}</TableCell>
              <TableCell>{getEscolaName(aluno.escola)}</TableCell>
              <TableCell>{aluno.class}</TableCell>
              <TableCell className="text-right">{currency((aluno as any).valor_album)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Dialog open={openAlunoId === aluno.id} onOpenChange={(o)=>{ if (!o) setOpenAlunoId(null); }}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" onClick={()=>setOpenAlunoId(aluno.id)}>Editar</Button>
                    </DialogTrigger>
                    {openAlunoId === aluno.id && (
                      <AlbumEditDialog aluno={aluno as any} onClose={()=>setOpenAlunoId(null)} />
                    )}
                  </Dialog>
                  <Button size="sm" onClick={()=>handlePdf(aluno as any)}>PDF</Button>
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

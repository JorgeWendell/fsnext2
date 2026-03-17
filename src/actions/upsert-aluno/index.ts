"use server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { alunosTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertAlunoSchema } from "./schema";

export const upsertAluno = actionClient
  .schema(upsertAlunoSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    await db
      .insert(alunosTable)
      .values({
        id: parsedInput.id,
        escola: parsedInput.escola,
        name: parsedInput.name,
        codigo: parsedInput.codigo,
        class: parsedInput.class,
        ano_formacao: parsedInput.ano_formacao,
        address: parsedInput.address,
        phone: parsedInput.phone,
        sex: parsedInput.sex,
        album: parsedInput.album ?? false,
        valor_album: parsedInput.valor_album,
        colacao: parsedInput.colacao ?? false,
        valor_colacao: parsedInput.valor_colacao,
        baile: parsedInput.baile ?? false,
        valor_baile: parsedInput.valor_baile,
        convite_inteira: parsedInput.convite_inteira ?? false,
        valor_convite_inteira: parsedInput.valor_convite_inteira,
        convite_meia: parsedInput.convite_meia ?? false,
        valor_convite_meia: parsedInput.valor_convite_meia,
        active: parsedInput.active ?? true,
      })
      .onConflictDoUpdate({
        target: alunosTable.id,
        set: {
          name: parsedInput.name,
          codigo: parsedInput.codigo,
          class: parsedInput.class,
          ano_formacao: parsedInput.ano_formacao,
          address: parsedInput.address,
          phone: parsedInput.phone,
          sex: parsedInput.sex,
          escola: parsedInput.escola,
          album: parsedInput.album ?? false,
          valor_album: parsedInput.valor_album,
          colacao: parsedInput.colacao ?? false,
          valor_colacao: parsedInput.valor_colacao,
          baile: parsedInput.baile ?? false,
          valor_baile: parsedInput.valor_baile,
          convite_inteira: parsedInput.convite_inteira ?? false,
          valor_convite_inteira: parsedInput.valor_convite_inteira,
          convite_meia: parsedInput.convite_meia ?? false,
          valor_convite_meia: parsedInput.valor_convite_meia,
          active: parsedInput.active ?? true,
        },
      });
    revalidatePath("/alunos");
  });

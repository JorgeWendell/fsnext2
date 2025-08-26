"use server";
import { db } from "@/db";

import { alunosTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { actionClient } from "@/lib/next-safe-action";
import { upsertAlunoSchema } from "./schema";
import { revalidatePath } from "next/cache";

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
        class: parsedInput.class,
        address: parsedInput.address,
        phone: parsedInput.phone,
        sex: parsedInput.sex,
        album: parsedInput.album ?? false,
        valor_album: parsedInput.valor_album,
        colacao: parsedInput.colacao ?? false,
        valor_colacao: parsedInput.valor_colacao,
        baile: parsedInput.baile ?? false,
        valor_baile: parsedInput.valor_baile,
        convite_extra: parsedInput.convite_extra ?? false,
        valor_convite_extra: parsedInput.valor_convite_extra,
      })
      .onConflictDoUpdate({
        target: alunosTable.id,
        set: {
          name: parsedInput.name,
          class: parsedInput.class,
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
          convite_extra: parsedInput.convite_extra ?? false,
          valor_convite_extra: parsedInput.valor_convite_extra,
        },
      });
    revalidatePath("/alunos");
  });

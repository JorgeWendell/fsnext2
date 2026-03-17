"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { pacotesTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

import { upsertPacoteSchema } from "./schema";

export const upsertPacote = actionClient
  .schema(upsertPacoteSchema)
  .action(async ({ parsedInput }) => {
    await db
      .insert(pacotesTable)
      .values({
        id: parsedInput.id,
        name: parsedInput.name,
        colacao: parsedInput.colacao,
        baile: parsedInput.baile,
        album: parsedInput.album,
        conviteInteira: parsedInput.conviteInteira,
        conviteMeia: parsedInput.conviteMeia,
        conviteExtraInteira: parsedInput.conviteExtraInteira,
        conviteExtraMeia: parsedInput.conviteExtraMeia,
      })
      .onConflictDoUpdate({
        target: pacotesTable.id,
        set: {
          name: parsedInput.name,
          colacao: parsedInput.colacao,
          baile: parsedInput.baile,
          album: parsedInput.album,
          conviteInteira: parsedInput.conviteInteira,
          conviteMeia: parsedInput.conviteMeia,
          conviteExtraInteira: parsedInput.conviteExtraInteira,
          conviteExtraMeia: parsedInput.conviteExtraMeia,
        },
      });

    revalidatePath("/configuracoes/gestao-pacotes");
  });


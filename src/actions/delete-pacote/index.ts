"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { pacotesTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

import { deletePacoteSchema } from "./schema";

export const deletePacote = actionClient
  .schema(deletePacoteSchema)
  .action(async ({ parsedInput }) => {
    await db
      .delete(pacotesTable)
      .where(eq(pacotesTable.id, parsedInput.id));

    revalidatePath("/configuracoes/gestao-pacotes");
  });


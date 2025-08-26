"use server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { escolasTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertEscolaSchema } from "./schema";

export const upsertEscola = actionClient
  .schema(upsertEscolaSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    await db
      .insert(escolasTable)
      .values({
        id: parsedInput.id,
        representanteId: parsedInput.representante,
        ...parsedInput,
      })
      .onConflictDoUpdate({
        target: escolasTable.id,
        set: {
          ...parsedInput,
        },
      });
    revalidatePath("/escolas");
  });

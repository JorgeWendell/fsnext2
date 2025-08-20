"use server";
import { db } from "@/db";

import { representantesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { actionClient } from "@/lib/next-safe-action";
import { upsertRepresentanteSchema } from "./schema";

export const upsertRepresentante = actionClient
  .schema(upsertRepresentanteSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    await db
      .insert(representantesTable)
      .values({
        id: parsedInput.id,
        ...parsedInput,
      })
      .onConflictDoUpdate({
        target: representantesTable.id,
        set: {
          ...parsedInput,
        },
      });
  });

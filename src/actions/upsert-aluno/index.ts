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
        ...parsedInput,
      })
      .onConflictDoUpdate({
        target: alunosTable.id,
        set: {
          ...parsedInput,
        },
      });
    revalidatePath("/alunos");
  });

"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { alunoExtrasTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { deleteAlunoExtraSchema } from "./schema";

export const deleteAlunoExtra = actionClient
  .schema(deleteAlunoExtraSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    await db
      .delete(alunoExtrasTable)
      .where(
        and(
          eq(alunoExtrasTable.id, parsedInput.id),
          eq(alunoExtrasTable.alunoId, parsedInput.alunoId),
        ),
      );

    revalidatePath("/financeiro");
    revalidatePath("/alunos");
  });

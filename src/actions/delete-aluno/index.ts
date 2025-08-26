"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import z from "zod";

import { db } from "@/db";
import { alunosTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

export const deleteAluno = actionClient
  .schema(
    z.object({
      id: z.string(),
    })
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    await db
      .delete(alunosTable)
      .where(eq(alunosTable.id, parsedInput.id))
      .returning();

    revalidatePath("/alunos");
  });

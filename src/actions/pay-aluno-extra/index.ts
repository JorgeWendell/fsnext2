"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { alunoExtrasTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { payAlunoExtraSchema } from "./schema";

export const payAlunoExtra = actionClient
  .schema(payAlunoExtraSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    await db
      .update(alunoExtrasTable)
      .set({
        paid: true,
        paidMethod: parsedInput.method,
        paidAt: new Date(),
      })
      .where(eq(alunoExtrasTable.alunoId, parsedInput.alunoId));

    revalidatePath("/financeiro");
    revalidatePath("/alunos");
  });


"use server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { alunoExtrasTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { addAlunoExtraSchema } from "./schema";

export const addAlunoExtra = actionClient
  .schema(addAlunoExtraSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    await db.insert(alunoExtrasTable).values({
      alunoId: parsedInput.alunoId,
      type: parsedInput.type,
      total: parsedInput.total,
      quantity: String(parsedInput.quantity ?? 1),
    });

    revalidatePath("/alunos");
  });


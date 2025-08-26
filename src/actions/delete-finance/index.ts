"use server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { financesTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const deleteFinance = actionClient
  .schema(
    z.object({
      id: z.string(),
    })
  )
  .action(async ({ parsedInput }) => {
    try {
      await db.delete(financesTable).where(eq(financesTable.id, parsedInput.id));
      return { success: true };
    } catch (error) {
      console.error("Erro ao deletar dados financeiros:", error);
      return { error: "Erro ao deletar dados financeiros" };
    }
  });

"use server";
import { db } from "@/db";
import { financesTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const updateBoletoStatus = actionClient
  .schema(
    z.object({
      financeId: z.string(),
      parcela: z.number(),
      isPaid: z.boolean(),
    })
  )
  .action(async ({ parsedInput }) => {
    const { financeId, parcela, isPaid } = parsedInput;

    // Buscar o registro atual para obter o status das parcelas existente
    const currentFinance = await db
      .select()
      .from(financesTable)
      .where(eq(financesTable.id, financeId))
      .limit(1);

    if (currentFinance.length === 0) {
      throw new Error("Transação não encontrada");
    }

    const currentParcelasPagas = currentFinance[0].parcelasPagas 
      ? JSON.parse(currentFinance[0].parcelasPagas) 
      : {};

    // Atualizar o status da parcela específica
    const updatedParcelasPagas = {
      ...currentParcelasPagas,
      [parcela]: isPaid
    };

    // Atualizar o status de pagamento no banco de dados
    await db
      .update(financesTable)
      .set({
        parcelasPagas: JSON.stringify(updatedParcelasPagas)
      })
      .where(eq(financesTable.id, financeId));

    return { success: true };
  });

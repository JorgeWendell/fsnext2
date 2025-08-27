"use server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { financesTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const upsertFinance = actionClient
  .schema(
    z.object({
      id: z.string().optional(),
      method: z.enum(["pix", "debit", "creditvista", "creditparc", "bank_slip"]),
      bank_slip: z.enum(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]).optional(),
      valueTotal: z.string().min(1, "Valor total é obrigatório"),
      firstDueDate: z.string().optional(), // Data do primeiro vencimento para boletos
      alunoId: z.string().min(1, "Aluno é obrigatório"),
    })
  )
  .action(async ({ parsedInput }) => {
    try {
      const { id, method, bank_slip, valueTotal, firstDueDate, alunoId } = parsedInput;

      if (id) {
        // Atualizar financeiro existente
        await db
          .update(financesTable)
          .set({
            method,
            bank_slip,
            valueTotal,
            firstDueDate,
            alunoId,
            updateAt: new Date(),
          })
          .where(eq(financesTable.id, id));
      } else {
        // Inserir novo financeiro
        await db.insert(financesTable).values({
          method,
          bank_slip,
          valueTotal,
          firstDueDate,
          alunoId,
        });
      }

      return { success: true };
    } catch (error) {
      console.error("Erro ao salvar dados financeiros:", error);
      return { error: "Erro ao salvar dados financeiros" };
    }
  });

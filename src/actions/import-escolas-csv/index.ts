"use server";

import { and, eq, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import z from "zod";

import { db } from "@/db";
import { escolasTable, pacotesTable, representantesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { parseEscolasCsv } from "@/lib/parse-csv";
import { actionClient } from "@/lib/next-safe-action";

import { importEscolasCsvSchema } from "./schema";

const escolaRowSchema = z.object({
  name: z.string().trim().min(1, { message: "Nome é obrigatório" }),
  codigo: z
    .string()
    .trim()
    .length(3, { message: "Código deve ter exatamente 3 dígitos" })
    .regex(/^\d{3}$/, { message: "Código deve conter apenas números" }),
  ano: z
    .string()
    .trim()
    .length(4, { message: "Ano deve ter 4 dígitos" })
    .regex(/^\d{4}$/, { message: "Ano deve conter apenas números" })
    .optional()
    .or(z.literal("")),
  address: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  representante: z.string().trim().optional(),
  pacote: z.string().trim().optional(),
});

const uuidSchema = z.string().uuid();

function resolveRepresentanteId(
  value: string,
  representantes: { id: string; name: string }[],
): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (uuidSchema.safeParse(trimmed).success) {
    const byId = representantes.find((item) => item.id === trimmed);
    return byId?.id ?? null;
  }

  const normalized = trimmed.toLowerCase();
  const byName = representantes.find(
    (item) => item.name.trim().toLowerCase() === normalized,
  );
  return byName?.id ?? null;
}

function resolvePacoteId(
  value: string,
  pacotes: { id: string; name: string }[],
): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (uuidSchema.safeParse(trimmed).success) {
    const byId = pacotes.find((item) => item.id === trimmed);
    return byId?.id ?? null;
  }

  const normalized = trimmed.toLowerCase();
  const byName = pacotes.find(
    (item) => item.name.trim().toLowerCase() === normalized,
  );
  return byName?.id ?? null;
}

export const importEscolasCsv = actionClient
  .schema(importEscolasCsvSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const parsedRows = parseEscolasCsv(parsedInput.csvContent);
    if (parsedRows.length === 0) {
      throw new Error(
        "Nenhuma linha válida encontrada. Use o cabeçalho: nome,codigo,ano,endereco,telefone,representante,pacote",
      );
    }

    const [representantes, pacotes] = await Promise.all([
      db.select({ id: representantesTable.id, name: representantesTable.name }).from(representantesTable),
      db.select({ id: pacotesTable.id, name: pacotesTable.name }).from(pacotesTable),
    ]);

    let imported = 0;
    const errors: string[] = [];

    for (let index = 0; index < parsedRows.length; index++) {
      const lineNumber = index + 2;
      const row = parsedRows[index];

      const validation = escolaRowSchema.safeParse(row);
      if (!validation.success) {
        const message = validation.error.issues.map((issue) => issue.message).join(", ");
        errors.push(`Linha ${lineNumber}: ${message}`);
        continue;
      }

      const data = validation.data;

      let representanteId: string | null = null;
      if (data.representante) {
        representanteId = resolveRepresentanteId(
          data.representante,
          representantes,
        );

        if (!representanteId) {
          errors.push(
            `Linha ${lineNumber}: representante "${data.representante}" não encontrado`,
          );
          continue;
        }
      }

      let pacoteId: string | null = null;
      if (data.pacote) {
        pacoteId = resolvePacoteId(data.pacote, pacotes);
        if (!pacoteId) {
          errors.push(`Linha ${lineNumber}: pacote "${data.pacote}" não encontrado`);
          continue;
        }
      }

      const ano = data.ano || null;

      const existing = await db.query.escolasTable.findFirst({
        where: ano
          ? and(eq(escolasTable.codigo, data.codigo), eq(escolasTable.ano, ano))
          : and(
              eq(escolasTable.codigo, data.codigo),
              or(
                sql`${escolasTable.ano} is null`,
                eq(escolasTable.ano, ""),
              ),
            ),
      });

      if (existing) {
        await db
          .update(escolasTable)
          .set({
            name: data.name,
            address: data.address || null,
            phone: data.phone || null,
            representanteId,
            pacoteId,
            ano,
          })
          .where(eq(escolasTable.id, existing.id));
      } else {
        await db.insert(escolasTable).values({
          name: data.name,
          codigo: data.codigo,
          ano,
          address: data.address || null,
          phone: data.phone || null,
          representanteId,
          pacoteId,
        });
      }

      imported++;
    }

    revalidatePath("/escolas");
    revalidatePath("/configuracoes");

    return {
      imported,
      failed: errors.length,
      errors,
    };
  });

import z from "zod";

export const importEscolasCsvSchema = z.object({
  csvContent: z.string().trim().min(1, { message: "Arquivo CSV vazio" }),
});

export type ImportEscolasCsvSchema = z.infer<typeof importEscolasCsvSchema>;

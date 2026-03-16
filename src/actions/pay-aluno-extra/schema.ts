import z from "zod";

export const payAlunoExtraSchema = z.object({
  alunoId: z.string().uuid(),
  method: z.enum(["pix", "debit", "creditvista", "creditparc"]),
  total: z.string().trim().min(1, { message: "Valor é obrigatório" }),
});

export type PayAlunoExtraSchema = z.infer<typeof payAlunoExtraSchema>;


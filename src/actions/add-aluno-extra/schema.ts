import z from "zod";

export const addAlunoExtraSchema = z.object({
  alunoId: z.string().uuid(),
  type: z.enum(["album", "convite_extra"]),
  total: z
    .string()
    .trim()
    .min(1, { message: "Valor é obrigatório" }),
});

export type AddAlunoExtraSchema = z.infer<typeof addAlunoExtraSchema>;


import z from "zod";

export const deleteAlunoExtraSchema = z.object({
  id: z.string().uuid(),
  alunoId: z.string().uuid(),
});

export type DeleteAlunoExtraInput = z.infer<typeof deleteAlunoExtraSchema>;

import z from "zod";

export const deletePacoteSchema = z.object({
  id: z.string().uuid(),
});

export type DeletePacoteSchema = z.infer<typeof deletePacoteSchema>;


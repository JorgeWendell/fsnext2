import z from "zod";

export const upsertRepresentanteSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, { message: "Nome é obrigatório" }),
  phone: z.string().trim().min(1, { message: "Telefone é obrigatório" }),
});

export type UpsertRepresentanteSchema = z.infer<
  typeof upsertRepresentanteSchema
>;

import z from "zod";

export const upsertEscolaSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, { message: "Nome é obrigatório" }),
  address: z.string().trim().min(1, { message: "Endereço é obrigatório" }),
  phone: z.string().trim().min(1, { message: "Telefone é obrigatório" }),
  representante: z
    .string()
    .trim()
    .min(1, { message: "Representante é obrigatório" }),
});

export type upsertEscolaSchema = z.infer<typeof upsertEscolaSchema>;

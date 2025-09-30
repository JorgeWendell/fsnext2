import z from "zod";

export const upsertEscolaSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, { message: "Nome é obrigatório" }),
  codigo: z
    .string()
    .trim()
    .length(3, { message: "Código deve ter exatamente 3 dígitos" })
    .regex(/^\d{3}$/, { message: "Código deve conter apenas números" }),
  address: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  representante: z
    .string()
    .trim()
    .min(1, { message: "Representante é obrigatório" }),
});

export type upsertEscolaSchema = z.infer<typeof upsertEscolaSchema>;

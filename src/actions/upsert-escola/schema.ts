import z from "zod";

export const upsertEscolaSchema = z.object({
  id: z.string().optional(),
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
  pacoteId: z.string().uuid().optional().or(z.literal("")),
  representante: z
    .string()
    .trim()
    .min(1, { message: "Representante é obrigatório" }),
});

export type upsertEscolaSchema = z.infer<typeof upsertEscolaSchema>;

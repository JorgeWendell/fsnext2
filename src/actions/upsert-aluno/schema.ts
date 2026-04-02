import z from "zod";

export const upsertAlunoSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().toUpperCase().min(1, { message: "Nome é obrigatório" }),
  codigo: z
    .string()
    .trim()
    .length(3, { message: "Código deve ter exatamente 3 dígitos" })
    .regex(/^\d{3}$/, { message: "Código deve conter apenas números" }),
  class: z.string().trim().min(1, { message: "Classe é obrigatória" }),
  ano_formacao: z
    .string()
    .trim()
    .min(4, { message: "Ano de formação é obrigatório" }),
  address: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  sex: z.enum(["male", "female"], { message: "Sexo é obrigatório" }),
  escola: z.string().trim().min(1, { message: "Escola é obrigatória" }),
  album: z.boolean().default(false).optional(),
  valor_album: z.string().optional(),
  colacao: z.boolean().default(false).optional(),
  valor_colacao: z.string().optional(),
  baile: z.boolean().default(false).optional(),
  valor_baile: z.string().optional(),
  convite_inteira: z.boolean().default(false).optional(),
  valor_convite_inteira: z.string().optional(),
  qtd_convite_inteira: z.coerce.number().int().min(1).optional(),
  convite_meia: z.boolean().default(false).optional(),
  valor_convite_meia: z.string().optional(),
  qtd_convite_meia: z.coerce.number().int().min(1).optional(),
  active: z.boolean().default(true).optional(),
});

export type upsertAlunoSchema = z.infer<typeof upsertAlunoSchema>;

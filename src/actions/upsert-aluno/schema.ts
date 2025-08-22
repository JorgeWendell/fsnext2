import z from "zod";

export const upsertAlunoSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, { message: "Nome é obrigatório" }),
  class: z.string().trim().min(1, { message: "Classe é obrigatória" }),
  address: z.string().trim().min(1, { message: "Endereço é obrigatório" }),
  phone: z.string().trim().min(1, { message: "Telefone é obrigatório" }),
  sex: z.enum(["male", "female"], { message: "Sexo é obrigatório" }),
  escola: z
    .string()
    .trim()
    .min(1, { message: "Escola é obrigatória" }),
});

export type upsertAlunoSchema = z.infer<typeof upsertAlunoSchema>;

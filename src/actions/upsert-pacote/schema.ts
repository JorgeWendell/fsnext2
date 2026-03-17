import z from "zod";

export const upsertPacoteSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, { message: "Nome é obrigatório" }),
  colacao: z.string().trim().optional(),
  baile: z.string().trim().optional(),
  album: z.string().trim().optional(),
  conviteInteira: z.string().trim().optional(),
  conviteMeia: z.string().trim().optional(),
  conviteExtraInteira: z.string().trim().optional(),
  conviteExtraMeia: z.string().trim().optional(),
});

export type UpsertPacoteSchema = z.infer<typeof upsertPacoteSchema>;


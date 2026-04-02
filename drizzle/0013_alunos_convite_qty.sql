ALTER TABLE "alunos" ADD COLUMN IF NOT EXISTS "qtd_convite_inteira" integer DEFAULT 1 NOT NULL;
ALTER TABLE "alunos" ADD COLUMN IF NOT EXISTS "qtd_convite_meia" integer DEFAULT 1 NOT NULL;

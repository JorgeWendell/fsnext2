ALTER TABLE "alunos" ADD COLUMN IF NOT EXISTS "pendrive" boolean DEFAULT false NOT NULL;
ALTER TABLE "alunos" ADD COLUMN IF NOT EXISTS "valor_pendrive" text;
ALTER TABLE "pacotes" ADD COLUMN IF NOT EXISTS "pendrive" text;

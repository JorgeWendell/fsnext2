ALTER TABLE "alunos" ADD COLUMN IF NOT EXISTS "album" boolean DEFAULT false NOT NULL;
ALTER TABLE "alunos" ADD COLUMN IF NOT EXISTS "valor_album" text;
UPDATE "alunos"
SET "name" = upper(trim("name"))
WHERE "name" IS NOT NULL;

DO $$
DECLARE
  duplicated_name text;
BEGIN
  SELECT "name"
  INTO duplicated_name
  FROM "alunos"
  GROUP BY "name"
  HAVING COUNT(*) > 1
  LIMIT 1;

  IF duplicated_name IS NOT NULL THEN
    RAISE EXCEPTION 'Não foi possível criar a regra de nome único. Nome duplicado encontrado: %', duplicated_name;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "alunos_name_unique_idx" ON "alunos" ("name");

ALTER TABLE "alunos"
ADD CONSTRAINT "alunos_name_upper_check" CHECK ("name" = upper("name"));

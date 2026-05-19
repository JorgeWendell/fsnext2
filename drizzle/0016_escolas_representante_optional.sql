ALTER TABLE "escolas" DROP CONSTRAINT "escolas_representanteId_representantes_id_fk";
--> statement-breakpoint
ALTER TABLE "escolas" ALTER COLUMN "representanteId" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "escolas" ADD CONSTRAINT "escolas_representanteId_representantes_id_fk" FOREIGN KEY ("representanteId") REFERENCES "public"."representantes"("id") ON DELETE set null ON UPDATE no action;

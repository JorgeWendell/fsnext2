ALTER TABLE "alunos" DROP CONSTRAINT "alunos_escola_escolas_id_fk";
--> statement-breakpoint
ALTER TABLE "escolas" DROP CONSTRAINT "escolas_representanteId_representantes_id_fk";
--> statement-breakpoint
ALTER TABLE "finances" DROP CONSTRAINT "finances_alunoId_alunos_id_fk";
--> statement-breakpoint
ALTER TABLE "alunos" ADD CONSTRAINT "alunos_escola_escolas_id_fk" FOREIGN KEY ("escola") REFERENCES "public"."escolas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escolas" ADD CONSTRAINT "escolas_representanteId_representantes_id_fk" FOREIGN KEY ("representanteId") REFERENCES "public"."representantes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finances" ADD CONSTRAINT "finances_alunoId_alunos_id_fk" FOREIGN KEY ("alunoId") REFERENCES "public"."alunos"("id") ON DELETE cascade ON UPDATE no action;
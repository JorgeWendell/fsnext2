CREATE TYPE "public"."alunos_sex" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "public"."finances_bank_slip" AS ENUM('1', '2', '3', '4', '5', '6', '7', '8', '9', '10');--> statement-breakpoint
CREATE TYPE "public"."finances_method" AS ENUM('pix', 'debit', 'creditvista', 'creditparc', 'bank_slip');--> statement-breakpoint
CREATE TABLE "alunos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"class" text NOT NULL,
	"escola" uuid NOT NULL,
	"address" text NOT NULL,
	"phone" text NOT NULL,
	"sex" "alunos_sex" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"update_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "escolas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"phone" text NOT NULL,
	"representanteId" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"update_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"method" "finances_method" NOT NULL,
	"bank_slip" "finances_bank_slip",
	"value" text NOT NULL,
	"alunoId" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"update_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "representantes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"update_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"password" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "alunos" ADD CONSTRAINT "alunos_escola_escolas_id_fk" FOREIGN KEY ("escola") REFERENCES "public"."escolas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escolas" ADD CONSTRAINT "escolas_representanteId_representantes_id_fk" FOREIGN KEY ("representanteId") REFERENCES "public"."representantes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finances" ADD CONSTRAINT "finances_alunoId_alunos_id_fk" FOREIGN KEY ("alunoId") REFERENCES "public"."alunos"("id") ON DELETE set null ON UPDATE no action;
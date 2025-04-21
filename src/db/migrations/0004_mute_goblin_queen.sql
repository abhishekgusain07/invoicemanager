CREATE TYPE "public"."invoice_status" AS ENUM('pending', 'paid', 'overdue', 'cancelled', 'draft', 'partially_paid');--> statement-breakpoint
CREATE TABLE "client_invoices" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"client_name" text NOT NULL,
	"client_email" text NOT NULL,
	"invoice_number" text NOT NULL,
	"amount" numeric NOT NULL,
	"currency" text NOT NULL,
	"issue_date" timestamp NOT NULL,
	"due_date" timestamp NOT NULL,
	"description" text,
	"additional_notes" text,
	"status" "invoice_status" DEFAULT 'pending' NOT NULL,
	"payment_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "client_invoices" ADD CONSTRAINT "client_invoices_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
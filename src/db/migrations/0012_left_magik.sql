CREATE TABLE "generated_invoices" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"invoice_number" text NOT NULL,
	"invoice_title" text,
	"date_of_issue" timestamp NOT NULL,
	"payment_due" timestamp NOT NULL,
	"language" text DEFAULT 'en' NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"date_format" text DEFAULT 'YYYY-MM-DD' NOT NULL,
	"template" text DEFAULT 'default' NOT NULL,
	"invoice_data" text NOT NULL,
	"total_amount" numeric NOT NULL,
	"shareable_token" text,
	"is_publicly_shareable" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "generated_invoices" ADD CONSTRAINT "generated_invoices_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
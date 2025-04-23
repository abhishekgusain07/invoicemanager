CREATE TYPE "public"."email_delivery_status" AS ENUM('sent', 'delivered', 'failed', 'opened', 'clicked', 'replied', 'bounced');--> statement-breakpoint
CREATE TABLE "invoice_reminders" (
	"id" text PRIMARY KEY NOT NULL,
	"invoice_id" text NOT NULL,
	"user_id" text NOT NULL,
	"reminder_number" integer NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"tone" "reminder_tone" NOT NULL,
	"email_subject" text NOT NULL,
	"email_content" text NOT NULL,
	"status" "email_delivery_status" DEFAULT 'sent',
	"delivered_at" timestamp,
	"opened_at" timestamp,
	"clicked_at" timestamp,
	"response_received" boolean DEFAULT false,
	"response_received_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "invoice_reminders" ADD CONSTRAINT "invoice_reminders_invoice_id_client_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."client_invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_reminders" ADD CONSTRAINT "invoice_reminders_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
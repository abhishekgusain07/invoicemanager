CREATE TABLE "invoices" (
	"id" text PRIMARY KEY NOT NULL,
	"created_time" timestamp DEFAULT now(),
	"invoice_id" text,
	"subscription_id" text,
	"amount_paid" text,
	"amount_due" text,
	"currency" text,
	"status" text,
	"email" text,
	"user_id" text
);
--> statement-breakpoint
CREATE TABLE "subscriptions_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"created_time" timestamp DEFAULT now(),
	"plan_id" text,
	"name" text,
	"description" text,
	"amount" text,
	"currency" text,
	"interval" text
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"created_time" timestamp DEFAULT now(),
	"subscription_id" text,
	"stripe_user_id" text,
	"status" text,
	"start_date" text,
	"end_date" text,
	"plan_id" text,
	"default_payment_method_id" text,
	"email" text,
	"user_id" text
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "subscription" text;
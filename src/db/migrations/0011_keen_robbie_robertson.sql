CREATE TYPE "public"."template_category" AS ENUM('reminder', 'thank_you', 'follow_up', 'notice', 'welcome', 'custom');--> statement-breakpoint
CREATE TYPE "public"."template_type" AS ENUM('system', 'custom');--> statement-breakpoint
ALTER TABLE "email_templates" ADD COLUMN "html_content" text;--> statement-breakpoint
ALTER TABLE "email_templates" ADD COLUMN "text_content" text;--> statement-breakpoint
ALTER TABLE "email_templates" ADD COLUMN "template_type" "template_type" DEFAULT 'custom';--> statement-breakpoint
ALTER TABLE "email_templates" ADD COLUMN "category" "template_category" DEFAULT 'reminder';--> statement-breakpoint
ALTER TABLE "email_templates" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "email_templates" ADD COLUMN "usage_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "email_templates" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "email_templates" ADD COLUMN "tags" text;
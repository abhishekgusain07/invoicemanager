ALTER TABLE "user_settings" ADD COLUMN "cc_accountant" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "use_branded_emails" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "send_copy_to_self" boolean DEFAULT false;
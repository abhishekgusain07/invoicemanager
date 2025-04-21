CREATE TYPE "public"."reminder_tone" AS ENUM('polite', 'friendly', 'neutral', 'firm', 'direct', 'assertive', 'urgent', 'final', 'serious');--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"is_automated_reminders" boolean DEFAULT true,
	"first_reminder_days" integer DEFAULT 3,
	"follow_up_frequency" integer DEFAULT 7,
	"max_reminders" integer DEFAULT 3,
	"first_reminder_tone" "reminder_tone" DEFAULT 'polite',
	"second_reminder_tone" "reminder_tone" DEFAULT 'firm',
	"third_reminder_tone" "reminder_tone" DEFAULT 'urgent',
	"business_name" text,
	"phone_number" text,
	"from_name" text,
	"email_signature" text DEFAULT 'Best regards,',
	"default_cc" text,
	"default_bcc" text,
	"preview_emails" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
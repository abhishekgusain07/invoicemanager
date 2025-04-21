CREATE TYPE "public"."feature_priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."feature_status" AS ENUM('new', 'under_review', 'planned', 'in_progress', 'completed', 'declined');--> statement-breakpoint
CREATE TABLE "feature_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"created_time" timestamp DEFAULT now(),
	"updated_time" timestamp DEFAULT now(),
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"priority" "feature_priority" DEFAULT 'medium' NOT NULL,
	"status" "feature_status" DEFAULT 'new' NOT NULL,
	"admin_notes" text,
	"upvotes" integer DEFAULT 0
);
--> statement-breakpoint
ALTER TABLE "feature_requests" ADD CONSTRAINT "feature_requests_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
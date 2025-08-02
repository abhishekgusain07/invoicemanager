CREATE TYPE "public"."github_action_status" AS ENUM('running', 'completed', 'failed', 'cancelled', 'skipped');--> statement-breakpoint
CREATE TABLE "github_action_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"action_name" text NOT NULL,
	"run_id" text NOT NULL,
	"workflow_name" text NOT NULL,
	"git_ref" text NOT NULL,
	"environment" text NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp,
	"duration_ms" integer,
	"status" "github_action_status" DEFAULT 'running' NOT NULL,
	"trigger_event" text NOT NULL,
	"actor" text,
	"metadata" text,
	"error_details" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

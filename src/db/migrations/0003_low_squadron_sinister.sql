CREATE TABLE "feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"created_time" timestamp DEFAULT now(),
	"user_id" text,
	"feedback_content" text,
	"stars" integer NOT NULL
);

CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "account_provider_account_idx" ON "account" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "client_invoices_user_created_idx" ON "client_invoices" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "client_invoices_user_updated_idx" ON "client_invoices" USING btree ("user_id","updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "client_invoices_user_status_idx" ON "client_invoices" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "client_invoices_user_status_due_idx" ON "client_invoices" USING btree ("user_id","status","due_date");--> statement-breakpoint
CREATE INDEX "client_invoices_user_issue_date_idx" ON "client_invoices" USING btree ("user_id","issue_date");--> statement-breakpoint
CREATE INDEX "client_invoices_user_invoice_number_idx" ON "client_invoices" USING btree ("user_id","invoice_number");--> statement-breakpoint
CREATE INDEX "client_invoices_user_client_email_idx" ON "client_invoices" USING btree ("user_id","client_email");--> statement-breakpoint
CREATE INDEX "client_invoices_overdue_pending_idx" ON "client_invoices" USING btree ("status","due_date");--> statement-breakpoint
CREATE INDEX "email_templates_user_name_idx" ON "email_templates" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX "email_templates_user_tone_idx" ON "email_templates" USING btree ("user_id","tone");--> statement-breakpoint
CREATE INDEX "email_templates_user_usage_idx" ON "email_templates" USING btree ("user_id","usage_count");--> statement-breakpoint
CREATE INDEX "email_templates_user_active_idx" ON "email_templates" USING btree ("user_id","is_active");--> statement-breakpoint
CREATE INDEX "feature_requests_user_id_idx" ON "feature_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "feature_requests_status_idx" ON "feature_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "feature_requests_priority_idx" ON "feature_requests" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "feature_requests_upvotes_idx" ON "feature_requests" USING btree ("upvotes" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "generated_invoices_user_active_idx" ON "generated_invoices" USING btree ("user_id","updated_at" DESC NULLS LAST,"deleted_at");--> statement-breakpoint
CREATE INDEX "generated_invoices_user_created_idx" ON "generated_invoices" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "generated_invoices_shareable_token_idx" ON "generated_invoices" USING btree ("shareable_token");--> statement-breakpoint
CREATE INDEX "generated_invoices_public_share_idx" ON "generated_invoices" USING btree ("is_publicly_shareable","deleted_at");--> statement-breakpoint
CREATE INDEX "generated_invoices_user_invoice_number_idx" ON "generated_invoices" USING btree ("user_id","invoice_number");--> statement-breakpoint
CREATE INDEX "github_action_logs_action_status_idx" ON "github_action_logs" USING btree ("action_name","status");--> statement-breakpoint
CREATE INDEX "github_action_logs_status_idx" ON "github_action_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "github_action_logs_start_time_idx" ON "github_action_logs" USING btree ("start_time" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "github_action_logs_environment_idx" ON "github_action_logs" USING btree ("environment");--> statement-breakpoint
CREATE INDEX "github_action_logs_run_id_idx" ON "github_action_logs" USING btree ("run_id");--> statement-breakpoint
CREATE INDEX "github_action_logs_trigger_event_idx" ON "github_action_logs" USING btree ("trigger_event");--> statement-breakpoint
CREATE INDEX "invoice_reminders_invoice_sent_idx" ON "invoice_reminders" USING btree ("invoice_id","sent_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "invoice_reminders_user_id_idx" ON "invoice_reminders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "invoice_reminders_status_idx" ON "invoice_reminders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "invoice_reminders_user_status_idx" ON "invoice_reminders" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "invoice_reminders_response_received_idx" ON "invoice_reminders" USING btree ("response_received");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_expires_at_idx" ON "session" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "user_settings_user_id_idx" ON "user_settings" USING btree ("user_id");
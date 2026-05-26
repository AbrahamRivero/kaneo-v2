ALTER TABLE "recurring_task" ADD COLUMN "due_date_days_offset" integer;--> statement-breakpoint
ALTER TABLE "recurring_task" ADD COLUMN "label_ids" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
CREATE INDEX "recurring_task_nextRunAt_idx" ON "recurring_task" USING btree ("next_run_at");
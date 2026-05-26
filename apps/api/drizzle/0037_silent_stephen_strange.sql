ALTER TABLE "recurring_task" ADD COLUMN "created_by" text;--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "recurring_task_id" text;--> statement-breakpoint
ALTER TABLE "recurring_task" ADD CONSTRAINT "recurring_task_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_recurring_task_id_recurring_task_id_fk" FOREIGN KEY ("recurring_task_id") REFERENCES "public"."recurring_task"("id") ON DELETE set null ON UPDATE cascade;
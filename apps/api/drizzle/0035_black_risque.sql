CREATE TABLE "recurring_task" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"frequency" text DEFAULT 'weekly' NOT NULL,
	"interval_value" integer DEFAULT 1 NOT NULL,
	"day_of_week" integer,
	"day_of_month" integer,
	"cron_expression" text,
	"next_run_at" timestamp NOT NULL,
	"last_run_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"column_id" text,
	"assignee_id" text,
	"priority" text DEFAULT 'no-priority',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "recurring_task" ADD CONSTRAINT "recurring_task_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "recurring_task" ADD CONSTRAINT "recurring_task_column_id_column_id_fk" FOREIGN KEY ("column_id") REFERENCES "public"."column"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "recurring_task" ADD CONSTRAINT "recurring_task_assignee_id_user_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "recurring_task_projectId_idx" ON "recurring_task" USING btree ("project_id");
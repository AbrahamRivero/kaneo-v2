CREATE TABLE "recurring_task_checklist_item" (
	"id" text PRIMARY KEY NOT NULL,
	"recurring_task_id" text NOT NULL,
	"text" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_checklist_item" (
	"id" text PRIMARY KEY NOT NULL,
	"task_id" text NOT NULL,
	"text" text NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "recurring_task_checklist_item" ADD CONSTRAINT "recurring_task_checklist_item_recurring_task_id_recurring_task_id_fk" FOREIGN KEY ("recurring_task_id") REFERENCES "public"."recurring_task"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "task_checklist_item" ADD CONSTRAINT "task_checklist_item_task_id_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."task"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "recurring_task_checklist_item_recurringTaskId_idx" ON "recurring_task_checklist_item" USING btree ("recurring_task_id");--> statement-breakpoint
CREATE INDEX "task_checklist_item_taskId_idx" ON "task_checklist_item" USING btree ("task_id");
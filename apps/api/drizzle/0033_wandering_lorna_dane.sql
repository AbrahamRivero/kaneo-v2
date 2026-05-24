CREATE TABLE "budget_expense" (
	"id" text PRIMARY KEY NOT NULL,
	"budget_id" text NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"category" text,
	"incurred_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "budget" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"total_budget" numeric(12, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "budget_project_id_unique" UNIQUE("project_id")
);
--> statement-breakpoint
ALTER TABLE "budget_expense" ADD CONSTRAINT "budget_expense_budget_id_budget_id_fk" FOREIGN KEY ("budget_id") REFERENCES "public"."budget"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "budget" ADD CONSTRAINT "budget_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "budget_expense_budgetId_idx" ON "budget_expense" USING btree ("budget_id");--> statement-breakpoint
CREATE INDEX "budget_projectId_idx" ON "budget" USING btree ("project_id");
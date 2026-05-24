CREATE TABLE "service_order" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"supplier_id" text NOT NULL,
	"contract_id" text,
	"project_id" text,
	"title" text NOT NULL,
	"description" text,
	"amount" numeric(12, 2),
	"status" text DEFAULT 'draft' NOT NULL,
	"ordered_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplier_contract" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"supplier_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"value" numeric(12, 2),
	"start_date" timestamp,
	"end_date" timestamp,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplier" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"contact_name" text,
	"contact_email" text,
	"contact_phone" text,
	"website" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "service_order" ADD CONSTRAINT "service_order_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "service_order" ADD CONSTRAINT "service_order_supplier_id_supplier_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."supplier"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "service_order" ADD CONSTRAINT "service_order_contract_id_supplier_contract_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."supplier_contract"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "service_order" ADD CONSTRAINT "service_order_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "supplier_contract" ADD CONSTRAINT "supplier_contract_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "supplier_contract" ADD CONSTRAINT "supplier_contract_supplier_id_supplier_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."supplier"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "supplier" ADD CONSTRAINT "supplier_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "order_supplierId_idx" ON "service_order" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "order_workspaceId_idx" ON "service_order" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "order_contractId_idx" ON "service_order" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "order_projectId_idx" ON "service_order" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "contract_supplierId_idx" ON "supplier_contract" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "contract_workspaceId_idx" ON "supplier_contract" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "supplier_workspaceId_idx" ON "supplier" USING btree ("workspace_id");
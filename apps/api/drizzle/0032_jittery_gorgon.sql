CREATE TABLE "workspace_feature" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"feature_key" text NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"config" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "workspace_feature_workspace_key_unique" UNIQUE("workspace_id","feature_key")
);
--> statement-breakpoint
ALTER TABLE "workspace_feature" ADD CONSTRAINT "workspace_feature_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "workspace_feature_workspace_idx" ON "workspace_feature" USING btree ("workspace_id");
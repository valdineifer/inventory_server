CREATE TABLE IF NOT EXISTS "computer_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"computer_id" integer,
	"old_object" json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "computer_log" ADD CONSTRAINT "computer_log_computer_id_computer_id_fk" FOREIGN KEY ("computer_id") REFERENCES "computer"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

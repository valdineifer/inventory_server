CREATE TABLE IF NOT EXISTS "computer" (
	"id" serial PRIMARY KEY NOT NULL,
	"mac" text NOT NULL,
	"ip" text NOT NULL,
	"laboratory_id" integer,
	"info" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "computer_mac_unique" UNIQUE("mac"),
	CONSTRAINT "computer_ip_unique" UNIQUE("ip")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "laboratory" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"code" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "laboratory_code_unique" UNIQUE("code")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "computer" ADD CONSTRAINT "computer_laboratory_id_laboratory_id_fk" FOREIGN KEY ("laboratory_id") REFERENCES "laboratory"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

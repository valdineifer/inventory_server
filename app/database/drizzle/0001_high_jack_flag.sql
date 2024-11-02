DO $$ BEGIN
 CREATE TYPE "public"."status" AS ENUM('verified', 'unverified', 'rejected');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "computer" DROP CONSTRAINT "computer_laboratory_id_laboratory_id_fk";
--> statement-breakpoint
ALTER TABLE "computer_log" DROP CONSTRAINT "computer_log_computer_id_computer_id_fk";
--> statement-breakpoint
ALTER TABLE "computer" ADD COLUMN "status" "status" DEFAULT 'verified';--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "computer" ADD CONSTRAINT "computer_laboratory_id_laboratory_id_fk" FOREIGN KEY ("laboratory_id") REFERENCES "public"."laboratory"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "computer_log" ADD CONSTRAINT "computer_log_computer_id_computer_id_fk" FOREIGN KEY ("computer_id") REFERENCES "public"."computer"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

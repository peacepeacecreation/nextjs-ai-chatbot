CREATE TABLE IF NOT EXISTS "UserPrompt" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid,
	"promptType" varchar(32) DEFAULT 'lesson' NOT NULL,
	"promptText" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "UserPrompt_userId_promptType_pk" PRIMARY KEY("userId","promptType")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserPrompt" ADD CONSTRAINT "UserPrompt_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

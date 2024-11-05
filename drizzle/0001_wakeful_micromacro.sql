ALTER TABLE "notificationT" RENAME TO "notification";--> statement-breakpoint
ALTER TABLE "notification" DROP CONSTRAINT "notificationT_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "notification" ADD COLUMN "lapangan_id" uuid NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notification" ADD CONSTRAINT "notification_lapangan_id_lapangan_id_fk" FOREIGN KEY ("lapangan_id") REFERENCES "public"."lapangan"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

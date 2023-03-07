CREATE TABLE "public"."barters" ("id" serial NOT NULL, "user1_offers" text NOT NULL, "user2_offers" text NOT NULL, "state" text NOT NULL DEFAULT 'in_progress', PRIMARY KEY ("id") );

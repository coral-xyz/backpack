CREATE TABLE "public"."invitations" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "claimer_id" uuid, "created_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") , FOREIGN KEY ("claimer_id") REFERENCES "public"."users"("id") ON UPDATE cascade ON DELETE cascade);
CREATE EXTENSION IF NOT EXISTS pgcrypto;

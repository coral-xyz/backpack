CREATE TABLE "auth"."invitations" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" timestamptz NOT NULL DEFAULT now(), "data" jsonb, PRIMARY KEY ("id") );COMMENT ON TABLE "auth"."invitations" IS E'ids are beta invite codes';
CREATE EXTENSION IF NOT EXISTS pgcrypto;

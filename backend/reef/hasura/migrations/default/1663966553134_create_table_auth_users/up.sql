CREATE TABLE "auth"."users" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "username" citext NOT NULL,
  "pubkey" text NOT NULL,
  "invitation_id" uuid NOT NULL,
  "waitlist_id" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "last_active_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  FOREIGN KEY ("invitation_id") REFERENCES "auth"."invitations"("id") ON UPDATE cascade ON DELETE cascade,
  UNIQUE ("username"),
  UNIQUE ("pubkey"),
  UNIQUE ("invitation_id"),
  CONSTRAINT "username_format" CHECK (username ~ '^[a-z0-9_]{3,15}$'),
  CONSTRAINT "pubkey_format" CHECK (
    pubkey ~ '^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{32,44}$'
  )
);
CREATE OR REPLACE FUNCTION "auth"."set_current_timestamp_updated_at"() RETURNS TRIGGER AS $$
DECLARE _new record;
BEGIN _new := NEW;
_new."updated_at" = NOW();
RETURN _new;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "set_auth_users_updated_at" BEFORE
UPDATE ON "auth"."users" FOR EACH ROW EXECUTE PROCEDURE "auth"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_auth_users_updated_at" ON "auth"."users" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP VIEW "auth"."publickeys";
CREATE TABLE "auth"."public_keys" (
  "id" serial NOT NULL,
  "user_id" uuid REFERENCES "auth"."users" (id),
  "blockchain" text NOT NULL,
  "public_key" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);
INSERT into "auth"."public_keys" (user_id, public_key, blockchain, created_at)
  SELECT DISTINCT ON (user_id, blockchain) user_id, publickey, blockchain, created_at
  FROM "auth"."publickeys_history";
DROP TABLE "auth"."publickeys_history";

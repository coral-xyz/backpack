CREATE TABLE "auth"."publickeys_history" (
  "id" serial NOT NULL,
  "user_id" uuid REFERENCES "auth"."users" (id),
  "blockchain" text NOT NULL,
  "publickey" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);


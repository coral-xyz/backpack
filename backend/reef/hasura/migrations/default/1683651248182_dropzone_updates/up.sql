DROP table "dropzone"."distributors";

CREATE TABLE "dropzone"."distributor_categories" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" text NOT NULL, "data" jsonb, PRIMARY KEY ("id") );

CREATE TABLE "dropzone"."distributors" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "category_id" uuid, "data" jsonb, "public_key" Text NOT NULL, "mint_public_key" Text NOT NULL, "lookup_table_public_key" text, "transaction_signature" text, "published_at" timestamptz, "created_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("id") , FOREIGN KEY ("category_id") REFERENCES "dropzone"."distributor_categories"("id") ON UPDATE cascade ON DELETE cascade, UNIQUE ("public_key"));

CREATE TABLE "dropzone"."claims" ("distributor_id" uuid NOT NULL, "claimant_id" uuid NOT NULL, "claimant_public_key" text NOT NULL, "ordinal" integer NOT NULL, "amount" int8 NOT NULL, "transaction_signature" text, "claimed_at" timestamptz, "viewed_at" timestamptz, "created_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("distributor_id","claimant_id") , FOREIGN KEY ("distributor_id") REFERENCES "dropzone"."distributors"("id") ON UPDATE cascade ON DELETE cascade, FOREIGN KEY ("claimant_id") REFERENCES "auth"."users"("id") ON UPDATE cascade ON DELETE cascade);

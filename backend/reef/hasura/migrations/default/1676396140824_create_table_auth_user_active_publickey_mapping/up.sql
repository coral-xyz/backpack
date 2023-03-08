CREATE TABLE "auth"."user_active_publickey_mapping" ("blockchain" text NOT NULL, "public_key_id" integer NOT NULL, "user_id" uuid NOT NULL, PRIMARY KEY ("blockchain","user_id") );

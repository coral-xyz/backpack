ALTER TABLE "auth"."swaps" ALTER COLUMN "transaction_at" TYPE time without time zone USING "transaction_at"::time without time zone;

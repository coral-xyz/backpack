ALTER TABLE "auth"."swaps" ALTER COLUMN "transaction_at" TYPE timestamp with time zone USING current_date + "transaction_at";

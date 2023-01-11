alter table "public"."secure_transfer_transactions" alter column "message_id" drop not null;
alter table "public"."secure_transfer_transactions" add column "message_id" text;

alter table "auth"."users" alter column "blockchain" set default ''solana'::text';
alter table "auth"."users" alter column "blockchain" drop not null;
alter table "auth"."users" add column "blockchain" text;

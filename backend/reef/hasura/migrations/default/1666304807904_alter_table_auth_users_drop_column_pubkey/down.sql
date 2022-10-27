alter table "auth"."users" add constraint "users_pubkey_key" unique (pubkey);
alter table "auth"."users" alter column "pubkey" drop not null;
alter table "auth"."users" add column "pubkey" text;

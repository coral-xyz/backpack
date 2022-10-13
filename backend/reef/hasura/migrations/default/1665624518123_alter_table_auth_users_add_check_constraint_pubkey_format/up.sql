alter table "auth"."users" drop constraint "pubkey_format";
alter table "auth"."users" add constraint "pubkey_format" check (pubkey ~ '^[0123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{32,44}$'::text);

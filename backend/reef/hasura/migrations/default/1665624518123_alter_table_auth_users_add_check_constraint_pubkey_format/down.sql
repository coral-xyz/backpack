alter table "auth"."users" drop constraint "pubkey_format";
alter table "auth"."users" add constraint "pubkey_format" check (CHECK (pubkey ~ '^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{32,44}$'::text));

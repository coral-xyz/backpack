alter table "auth"."users" alter column "spam_count" set default 0;
alter table "auth"."users" alter column "spam_count" drop not null;
alter table "auth"."users" add column "spam_count" int4;

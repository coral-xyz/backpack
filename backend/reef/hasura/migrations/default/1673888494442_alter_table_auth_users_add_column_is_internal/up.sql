alter table "auth"."users" add column "is_internal" boolean
 not null default 'false';

-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- alter table "appstore"."pending_curator_reviews" add column "contact" text
--  not null;

alter table "appstore"."pending_curator_reviews" alter column "ix_data" set not null;
alter table "appstore"."pending_curator_reviews" alter column "ix_keys" set not null;

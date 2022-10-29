alter table "appstore"."pending_curator_reviews" add column "contact" text not null;
alter table "appstore"."pending_curator_reviews" alter column "ix_data" drop not null;
alter table "appstore"."pending_curator_reviews" alter column "ix_keys" drop not null;

comment on column "auth"."mad_feed_posts"."thumbnail_type" is E'User posts for mad feed';
alter table "auth"."mad_feed_posts" alter column "thumbnail_type" drop not null;
alter table "auth"."mad_feed_posts" add column "thumbnail_type" text;

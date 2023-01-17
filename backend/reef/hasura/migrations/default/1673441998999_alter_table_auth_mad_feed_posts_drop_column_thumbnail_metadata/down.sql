comment on column "auth"."mad_feed_posts"."thumbnail_metadata" is E'User posts for mad feed';
alter table "auth"."mad_feed_posts" alter column "thumbnail_metadata" drop not null;
alter table "auth"."mad_feed_posts" add column "thumbnail_metadata" json;

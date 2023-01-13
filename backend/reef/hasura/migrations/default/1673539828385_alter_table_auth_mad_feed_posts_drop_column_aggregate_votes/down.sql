comment on column "auth"."mad_feed_posts"."aggregate_votes" is E'User posts for mad feed';
alter table "auth"."mad_feed_posts" alter column "aggregate_votes" set default '0'::numeric;
alter table "auth"."mad_feed_posts" alter column "aggregate_votes" drop not null;
alter table "auth"."mad_feed_posts" add column "aggregate_votes" numeric;

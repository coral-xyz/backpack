alter table "auth"."mad_feed_posts" add column "aggregate_votes" numeric
 not null default '0';

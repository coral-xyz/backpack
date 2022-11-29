comment on column "auth"."twitter_users"."pfp_staked_since" is E'Connects backpack users to twitter users';
alter table "auth"."twitter_users" alter column "pfp_staked_since" drop not null;
alter table "auth"."twitter_users" add column "pfp_staked_since" time;

alter table "auth"."twitter_users" drop constraint "twitter_users_pkey";
alter table "auth"."twitter_users"
    add constraint "twitter_users_pkey"
    primary key ("twitter_username", "backpack_username");

alter table "auth"."friendships" drop constraint "friendships_pkey";
alter table "auth"."friendships"
    add constraint "friendships_pkey"
    primary key ("id");

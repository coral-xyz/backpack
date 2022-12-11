alter table "auth"."friend_requests" drop constraint "friend_requests_pkey";
alter table "auth"."friend_requests"
    add constraint "friend_requests_pkey"
    primary key ("id");

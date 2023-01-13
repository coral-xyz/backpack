alter table "auth"."mad_feed_votes" drop constraint "mad_feed_votes_pkey";
alter table "auth"."mad_feed_votes"
    add constraint "mad_feed_votes_pkey"
    primary key ("vote_id");

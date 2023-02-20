alter table "auth"."mad_feed_posts"
  add constraint "mad_feed_posts_parent_post_id_fkey"
  foreign key ("parent_post_id")
  references "auth"."mad_feed_posts"
  ("post_id") on update cascade on delete cascade;

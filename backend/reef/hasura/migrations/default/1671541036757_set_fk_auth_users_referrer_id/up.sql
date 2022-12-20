alter table "auth"."users"
  add constraint "users_referrer_id_fkey"
  foreign key ("referrer_id")
  references "auth"."users"
  ("id") on update cascade on delete cascade;

alter table "public"."images"
  add constraint "images_invite_code_fkey"
  foreign key ("invite_code")
  references "auth"."invitations"
  ("id") on update cascade on delete cascade;

alter table "appstore"."pending_curator_reviews" drop constraint "pending_curator_reviews_pkey";
alter table "appstore"."pending_curator_reviews"
    add constraint "pending_curator_reviews_pkey"
    primary key ("id", "xnft");

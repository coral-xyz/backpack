alter table "auth"."xnft_preferences" drop constraint "xnft_preferences_pkey";
alter table "auth"."xnft_preferences"
    add constraint "xnft_preferences_pkey"
    primary key ("id2");

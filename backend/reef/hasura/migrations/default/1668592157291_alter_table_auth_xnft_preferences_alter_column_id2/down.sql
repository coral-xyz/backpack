alter table "auth"."xnft_preferences" rename column "disabled" to "id2";
alter table "auth"."xnft_preferences" alter column "id2" set not null;

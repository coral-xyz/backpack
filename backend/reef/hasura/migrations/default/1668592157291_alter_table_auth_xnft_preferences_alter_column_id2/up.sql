alter table "auth"."xnft_preferences" alter column "id2" drop not null;
alter table "auth"."xnft_preferences" rename column "id2" to "disabled";

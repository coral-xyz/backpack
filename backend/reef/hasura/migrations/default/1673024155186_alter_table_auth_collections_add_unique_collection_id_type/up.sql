alter table "auth"."collections" add constraint "collections_collection_id_type_key" unique ("collection_id", "type");

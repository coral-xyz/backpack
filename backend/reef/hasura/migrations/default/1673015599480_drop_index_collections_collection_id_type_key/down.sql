CREATE  INDEX "collections_collection_id_type_key" on
  "auth"."collections" using btree ("collection_id", "type");

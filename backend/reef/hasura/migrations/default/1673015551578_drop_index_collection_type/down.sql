CREATE  INDEX "collection_type" on
  "auth"."collections" using btree ("collection_id", "type");

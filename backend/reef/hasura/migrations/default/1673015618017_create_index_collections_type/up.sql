CREATE UNIQUE INDEX "collections_type" on
  "auth"."collections" using btree ("collection_id", "type");

CREATE  INDEX "users_referrer_id_key" on
  "auth"."users" using btree ("referrer_id");

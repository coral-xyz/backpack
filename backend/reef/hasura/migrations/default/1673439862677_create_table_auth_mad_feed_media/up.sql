CREATE TABLE "auth"."mad_feed_media" ("media_id" uuid NOT NULL DEFAULT gen_random_uuid(), "url" text NOT NULL, "type" text NOT NULL, "metadata" json NOT NULL, "post_id" uuid NOT NULL, PRIMARY KEY ("media_id") , FOREIGN KEY ("post_id") REFERENCES "auth"."mad_feed_posts"("post_id") ON UPDATE cascade ON DELETE cascade, UNIQUE ("media_id"));COMMENT ON TABLE "auth"."mad_feed_media" IS E'Media attachments for mad feed posts';
CREATE EXTENSION IF NOT EXISTS pgcrypto;

BEGIN TRANSACTION;
ALTER TABLE "appstore"."pending_curator_reviews" DROP CONSTRAINT "pending_curator_reviews_pkey";

ALTER TABLE "appstore"."pending_curator_reviews"
    ADD CONSTRAINT "pending_curator_reviews_pkey" PRIMARY KEY ("id");
COMMIT TRANSACTION;

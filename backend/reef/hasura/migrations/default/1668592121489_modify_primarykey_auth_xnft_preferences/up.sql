BEGIN TRANSACTION;
ALTER TABLE "auth"."xnft_preferences" DROP CONSTRAINT "xnft_preferences_pkey";

ALTER TABLE "auth"."xnft_preferences"
    ADD CONSTRAINT "xnft_preferences_pkey" PRIMARY KEY ("id");
COMMIT TRANSACTION;

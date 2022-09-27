CREATE OR REPLACE FUNCTION "auth"."create_invitation_for_image_record"()
RETURNS TRIGGER AS $$
DECLARE
  invitation_id uuid;
BEGIN
  INSERT INTO "auth"."invitations" VALUES(DEFAULT) RETURNING "id" INTO invitation_id;
  NEW."invite_code" = invitation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "on_insert_image"
BEFORE INSERT ON "public"."images"
FOR EACH ROW
EXECUTE PROCEDURE "auth"."create_invitation_for_image_record"();
COMMENT ON TRIGGER "on_insert_image" ON "public"."images"
IS 'trigger to automatically create an invitation for a new image record';

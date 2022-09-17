DROP FUNCTION IF EXISTS check_if_nvitation_exists CASCADE;
CREATE FUNCTION check_if_nvitation_exists() 
   RETURNS TRIGGER 
   LANGUAGE PLPGSQL
AS $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM invitations WHERE id = NEW.invitation_id AND claimed_at IS NULL) THEN RAISE EXCEPTION 'Invitation not found or already claimed'; END IF;
  RETURN new;
END;
$$;

CREATE TRIGGER on_create_user
   BEFORE INSERT ON auth.users
   FOR EACH ROW
   EXECUTE PROCEDURE check_if_nvitation_exists();

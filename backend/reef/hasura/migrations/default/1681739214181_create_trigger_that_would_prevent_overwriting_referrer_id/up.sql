CREATE OR REPLACE FUNCTION auth.check_referrer_id_update() RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.referrer_id IS NOT NULL AND OLD.referrer_id IS NOT NULL) OR (NEW.referrer_id = NEW.id) THEN
    RAISE EXCEPTION 'referrer_id cannot be updated when it is already set or equal to user id';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_referrer_id_update_trigger
  BEFORE UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.referrer_id IS DISTINCT FROM NEW.referrer_id)
  EXECUTE FUNCTION auth.check_referrer_id_update();

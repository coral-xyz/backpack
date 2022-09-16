CREATE OR REPLACE VIEW public."active_invitations" AS
SELECT id,
CASE
        WHEN claimer_id IS NULL THEN 0
        ELSE 1
    END AS claimed
FROM invitations;

CREATE VIEW invitations AS
SELECT auth.invitations.id,
auth.users.created_at as claimed_at
FROM auth.invitations
LEFT OUTER JOIN auth.users
ON auth.users.invitation_id = auth.invitations.id;

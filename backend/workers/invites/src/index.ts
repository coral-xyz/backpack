/**
 * Invite Codes worker @ https://invites.backpack.workers.dev
 *
 * GET /check/VALID_CODE
 *
 * {
 *   "status": 200,
 *   "message": "Invite code is valid"
 * }
 *
 * GET /check/CLAIMED_CODE
 *
 * {
 *   "status": 409,
 *   "message": "Invite code has already been claimed"
 * }
 *
 * GET /check/INVALID_CODE
 *
 * {
 *   "status": 400,
 *   "message": "Invite code is not valid"
 * }
 *
 * GET /check/WRONG_CODE
 *
 * {
 *   "status": 400,
 *   "message": "Invite code is incorrect format"
 * }
 *
 * GET /check
 *
 * {
 *   "status": 400,
 *   "message": "No Invite code provided"
 * }
 *
 * GET /
 *
 * {
 *   "status": 200,
 *   "message": "ok"
 * }
 */

import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return json(c)("ok");
});

app.get("/check", (c) => {
  return json(c)("No Invite code provided", 400);
});

app.get("/check/:inviteCode", async (c) => {
  const j = json(c);

  try {
    const code = c.req.param("inviteCode");
    if (!code) {
      return j("No Invite code provided", 400);
    }
    if (
      code.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      )
    ) {
      return j("Invite code is valid");
    } else {
      return j("Invite code is incorrect format", 400);
    }
  } catch (err: any) {
    return j(err.message, 500);
  }
});

app.get("/stats", async (c) => {
  try {
    const res = await fetch(c.env.HASURA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${c.env.JWT}`,
      },
      body: JSON.stringify({
        query: `
          query($now: timestamptz) {
            invitations(limit: 1, where: {claimed_at: {_lt: $now}}, order_by: {claimed_at: desc}) {
              claimed_at
            }
          }
        `.trim(),
        variables: {
          now: new Date().toISOString(),
        },
      }),
    });

    const resJson = await res.json<any>();

    const latestClaimTimestamp =
      resJson?.data.invitations.length > 0
        ? resJson?.data.invitations[0].claimed_at
        : null;

    return c.json(
      {
        status: 200,
        data: { latestClaimTimestamp },
      },
      200
    );
  } catch (err: any) {
    return json(c)(err.message, 500);
  }
});

export default app;

const json =
  (c: any) =>
  (message: string, status = 200) =>
    c.json({ status, message }, status);

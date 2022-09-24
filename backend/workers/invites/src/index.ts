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

// TODO replace these with database connection
const EXAMPLE_CODES = {
  valid: "03054e82-6d6a-4910-bacf-98381761094d",
  claimed: "1136b1e6-b648-43b7-affa-882dd076b4b5",
};

app.get("/", (c) => {
  return json(c)("ok");
});

app.get("/check", (c) => {
  return json(c)("No Invite code provided", 400);
});

app.get("/check/:inviteCode", (c) => {
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
      if (code === EXAMPLE_CODES.valid) {
        return j("Invite code is valid");
      } else if (code === EXAMPLE_CODES.claimed) {
        return j("Invite code has already been claimed", 409);
      }
      return j("Invite code is not valid", 400);
    } else {
      return j("Invite code is incorrect format", 400);
    }
  } catch (err: any) {
    return j(err.message, 500);
  }
});

export default app;

const json =
  (c: any) =>
  (message: string, status = 200) =>
    c.json({ status, message }, status);

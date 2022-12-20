import express from "express";

import { setCookieOnResponse } from "../../auth/util";
import { CHROME_STORE_URL, REFERRER_COOKIE_NAME } from "../../config";
import { getUserByUsername } from "../../db/users";

const router = express.Router();

/**
 * Set a cookie on *.xnfts.dev that will be used to track referrals, then
 * redirect to the backpack chrome extension page
 */
router.get("/:username", async (req, res) => {
  const user = await getUserByUsername(req.params.username);
  setCookieOnResponse(req, res, REFERRER_COOKIE_NAME, String(user.id));
  return res.redirect(CHROME_STORE_URL);
});

export default router;

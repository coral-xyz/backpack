import express from "express";

import { setCookieOnResponse } from "../../auth/util";
import { getUserByUsername } from "../../db/users";

const router = express.Router();

/**
 * Set a cookie on *.xnfts.dev that will be used to track referrals, then
 * redirect to the backpack chrome extension page
 */
router.get("/:username", async (req, res) => {
  const user = await getUserByUsername(req.params.username);
  setCookieOnResponse(req, res, "referrer", String(user.id));
  return res.redirect(
    "https://chrome.google.com/webstore/detail/backpack/aflkmfhebedbjioipglgcbcmnbpgliof"
  );
});

export default router;

import { Router } from "express";
import passport from "passport";
import { Strategy as TwitterStrategy } from "passport-twitter";

import { TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET } from "../../config";

passport.use(
  new TwitterStrategy(
    {
      consumerKey: TWITTER_CONSUMER_KEY,
      consumerSecret: TWITTER_CONSUMER_SECRET,
      callbackURL: "/authenticate/twitter/callback",
    },
    async (_token, _tokenSecret, profile, cb) => {
      return cb(null, profile);
    }
  )
);

const router = Router();
router.use(passport.initialize());

router.get("/oauth", passport.authenticate("twitter"));

router.get(
  "/oauth/callback",
  passport.authenticate("twitter", { failureRedirect: "/login" }),
  async (req, res) => {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

router.get("/suggestions", (_req, res) => {
  res.status(200).json({
    suggestions: [
      { user: "anatoly", twitterHandle: "anatoly" },
      { user: "twitter_quitter", twitterHandle: undefined },
      { user: "ilikeverylongnames", twitterHandle: "ilikelongnames" },
      { user: "tristan", twitterHandle: "jackshaftoes" },
      { user: "joycenho", twitterHandle: "joycenho" },
      { user: "apetoshi", twitterHandle: undefined },
    ],
  });
});

export default router;

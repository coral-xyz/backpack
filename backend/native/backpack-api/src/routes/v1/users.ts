import express from "express";
import { extractUserId } from "../../auth/middleware";
import { getFriendships, setFriendship } from "../../db/friendships";
import { getUsersByPrefix } from "../../db/users";

const router = express.Router();

router.get("/", async (req, res) => {
  // @ts-ignore
  const usernamePrefix: string = req.query.usernamePrefix;

  await getUsersByPrefix({ usernamePrefix })
    .then((users) => {
      res.json({ users });
    })
    .catch((e) => {
      res.status(511).json({ msg: "Error while fetching users" });
    });
});

export default router;

import express from "express";
import { extractUserId } from "../../auth/middleware";
import {
  getFriendship,
  getFriendships,
  setFriendship,
} from "../../db/friendships";
import { getUser } from "../../db/users";

const router = express.Router();

router.post("/request", extractUserId, async (req, res) => {
  //@ts-ignore
  const uuid = req.id; // TODO from from
  // @ts-ignore
  const to: string = req.body.to;
  // @ts-ignore

  if (uuid === to) {
    res.status(411).json({
      msg: "To and from cant be the same",
    });
    return;
  }
  const sendRequest: boolean = req.body.sendRequest;

  await setFriendship({ from: uuid, to, sendRequest });
  res.json({});
});

router.get("/", extractUserId, async (req, res) => {
  //@ts-ignore
  const uuid = req.id; // TODO from from
  // @ts-ignore
  const userId: string = req.query.userId;
  // @ts-ignore

  if (userId === uuid) {
    res.json({
      are_friends: true,
    });
    return;
  }

  try {
    const { are_friends, request_sent } = await getFriendship({
      from: uuid,
      to: userId,
    });
    const user = await getUser(userId);
    res.json({
      user,
      are_friends,
      request_sent,
    });
  } catch (e) {
    console.log(e);
    res.status(503).json({ msg: "Internal server error" });
  }
});

export default router;

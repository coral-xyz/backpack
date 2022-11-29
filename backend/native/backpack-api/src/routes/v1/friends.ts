import express from "express";
import { extractUserId } from "../../auth/middleware";
import { getFriendships, setFriendship } from "../../db/friendships";

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

export default router;

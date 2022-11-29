import express from "express";
import { extractUserId } from "../../auth/middleware";
import { getFriendships, setFriendship } from "../../db/friendships";

const router = express.Router();

router.post("/request", async (req, res) => {
  //@ts-ignore
  const uuid = req.id || req.body.from; // TODO from from
  // @ts-ignore
  const to: string = req.body.to;
  // @ts-ignore

  const sendRequest: boolean = req.body.sendRequest;

  await setFriendship({ from: uuid, to, sendRequest });
  res.json({});
});

export default router;

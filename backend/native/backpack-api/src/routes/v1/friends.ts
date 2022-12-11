import express from "express";

import { extractUserId } from "../../auth/middleware";
import {
  getAllFriends,
  getFriendship,
  setBlocked,
  setFriendship,
  setSpam,
  unfriend,
} from "../../db/friendships";
import { getUser } from "../../db/users";

import { enrichFriendships } from "./inbox";

const router = express.Router();

router.post("/spam", extractUserId, async (req, res) => {
  //@ts-ignore
  const uuid: string = req.id; // TODO from from
  // @ts-ignore
  const to: string = req.body.to;
  // @ts-ignore

  if (uuid === to) {
    res.status(411).json({
      msg: "To and from cant be the same",
    });
    return;
  }
  const spam: boolean = req.body.spam;
  await setSpam({ from: uuid, to, spam });
  res.json({});
});

router.post("/block", extractUserId, async (req, res) => {
  //@ts-ignore
  const uuid: string = req.id; // TODO from from
  // @ts-ignore
  const to: string = req.body.to;
  // @ts-ignore

  if (uuid === to) {
    res.status(411).json({
      msg: "To and from cant be the same",
    });
    return;
  }
  const block: boolean = req.body.block;
  await setBlocked({ from: uuid, to, block });
  res.json({});
});

router.post("/unfriend", extractUserId, async (req, res) => {
  //@ts-ignore
  const uuid: string = req.id; // TODO from from
  // @ts-ignore
  const to: string = req.body.to;
  // @ts-ignore

  if (uuid === to) {
    res.status(411).json({
      msg: "To and from cant be the same",
    });
    return;
  }
  await unfriend({ from: uuid, to });
  res.json({});
});

router.post("/request", extractUserId, async (req, res) => {
  //@ts-ignore
  const uuid: string = req.id; // TODO from from
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

router.get("/all", extractUserId, async (req, res) => {
  //@ts-ignore
  const uuid: string = req.id; // TODO from from

  try {
    const friends = await getAllFriends({
      from: uuid,
    });
    const enrichedFriendships = await enrichFriendships(friends, uuid);
    res.json({ chats: enrichedFriendships });
  } catch (e) {
    console.log(e);
    res.status(503).json({ msg: "Internal server error" });
  }
});

router.get("/", extractUserId, async (req, res) => {
  //@ts-ignore
  const uuid: string = req.id; // TODO from from
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
    const { are_friends, request_sent, blocked, spam } = await getFriendship({
      from: uuid,
      to: userId,
    });
    const user = await getUser(userId);
    res.json({
      user,
      are_friends,
      request_sent,
      blocked,
      spam,
    });
  } catch (e) {
    console.log(e);
    res.status(503).json({ msg: "Internal server error" });
  }
});

export default router;

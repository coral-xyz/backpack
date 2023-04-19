import { enrichMessages, getHistoryUpdates } from "@coral-xyz/backend-common";
import type { SubscriptionType } from "@coral-xyz/common";
import express from "express";

import { ensureHasRoomAccess, extractUserId } from "../../auth/middleware";
import { getChats, updateSecureTransfer } from "../../db/chats";
import {
  updateLastReadGroup,
  updateLastReadIndividual,
} from "../../db/friendships";

const router = express.Router();

router.post(
  "/lastRead",
  extractUserId,
  ensureHasRoomAccess,
  async (req, res) => {
    // @ts-ignore
    const client_generated_uuid: string = req.body.client_generated_uuid;
    // @ts-ignore
    const { user1, user2 } = req.roomMetadata;
    //@ts-ignore
    const uuid: string = req.id;
    //@ts-ignore
    const type: SubscriptionType = req.query.type;
    // @ts-ignore
    const room: string = req.query.room;

    //TODO: add validateMessageOwnership here
    if (type === "individual") {
      await updateLastReadIndividual(
        user1,
        user2,
        client_generated_uuid,
        user1 === uuid ? "1" : "2"
      );
    } else {
      await updateLastReadGroup(uuid, room, client_generated_uuid);
    }
    res.json({});
  }
);

router.put("/message", extractUserId, ensureHasRoomAccess, async (req, res) => {
  //TODO: make this secure, there is a path to cancel but the UI shows the txn as redeemed.
  const room = req.query.room;
  const messageId = req.body.messageId;
  const state = req.body.state;
  const txn = req.body.txn;
  if (state !== "cancelled" && state !== "redeemed") {
    return res.status(411).json({ msg: "Incorrect state" });
  }
  await updateSecureTransfer(messageId, room, state, txn);
  res.json({});
});

router.get("/", extractUserId, ensureHasRoomAccess, async (req, res) => {
  // @ts-ignore
  const room: string = req.query.room;
  // @ts-ignore
  const type: SubscriptionType = req.query.type;
  const timestampBefore = req.query.timestampBefore
    ? // @ts-ignore
      new Date(parseInt(req.query.timestampBefore))
    : new Date();
  const timestampAfter = req.query.timestampAfter
    ? // @ts-ignore
      new Date(parseInt(req.query.timestampAfter))
    : new Date(0);
  const limit = Math.min(req.query.limit ? parseInt(req.query.limit) : 10, 100);
  // @ts-ignore
  const clientGeneratedUuid: string | undefined = req.query.clientGeneratedUuid;

  // @ts-ignore
  const chats = await getChats({
    room,
    type,
    timestampBefore,
    timestampAfter,
    limit,
    clientGeneratedUuid,
  });
  const enrichedChats = await enrichMessages(chats, room, type, false);
  res.json({ chats: enrichedChats });
});

router.get("/updates", extractUserId, ensureHasRoomAccess, async (req, res) => {
  // @ts-ignore
  const room: string = req.query.room;
  // @ts-ignore
  // @ts-ignore
  const lastSeen: number = parseInt(req.query.lastSeenUpdate || 0);
  // @ts-ignore
  const updatesSinceTimestamp = parseInt(req.query.updatesSinceTimestamp);

  const updates = await getHistoryUpdates(
    room,
    lastSeen,
    updatesSinceTimestamp
  );

  res.json({
    updates,
  });
});

export default router;

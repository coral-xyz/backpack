import { validateRoom } from "@coral-xyz/backend-common";
import type { BarterResponse } from "@coral-xyz/common";
import express from "express";

import {
  ensureHasRoomAccess,
  ensureIsActiveBarter,
  extractUserId,
} from "../../auth/middleware";
import {
  executeActiveBarter,
  getBarter,
  getOrCreateBarter,
  updateActiveBarter,
} from "../../db/barter";
import { getFriendshipById } from "../../db/friendships";
import { executeBarterRealtime, updateBarter } from "../../messaging/barter";
import { sendMessage } from "../../messaging/messaging";

const router = express.Router();

router.get("/active", extractUserId, ensureHasRoomAccess, async (req, res) => {
  // @ts-ignore
  const room: string = req.query.room;
  // @ts-ignore
  const uuid: string = req.id!;
  const barter = await getOrCreateBarter({ roomId: room });
  try {
    const parsedBarter = {
      user1_offers: JSON.parse(barter.barter.user1_offers),
      user2_offers: JSON.parse(barter.barter.user2_offers),
      state: barter.barter.state,
      id: barter.barter.id,
    };
    const friendship = await getFriendshipById({ roomId: parseInt(room) });
    if (!friendship) {
      return res.status(411).json({
        msg: "Friendship doesnt exist",
      });
    }

    const response: BarterResponse = {
      id: parsedBarter.id,
      state: parsedBarter.state,
      localOffers:
        friendship.user1 === uuid
          ? parsedBarter.user1_offers
          : parsedBarter.user2_offers,
      remoteOffers:
        friendship.user1 === uuid
          ? parsedBarter.user2_offers
          : parsedBarter.user1_offers,
    };

    res.json({
      barter: response,
    });
  } catch (e) {
    console.error(e);
  }
});

router.get("/", extractUserId, async (req, res) => {
  // @ts-ignore
  const uuid: string = req.id!;
  // @ts-ignore

  const barterId: string = req.query.barterId!;
  // @ts-ignore

  const barter = await getBarter({ barterId: parseInt(barterId) });

  if (!barter) {
    return res.status(411).json({
      msg: "Barter doesnt exist",
    });
  }

  const room = barter.room_id;
  const roomMetadata = await validateRoom(req.id!, room);
  if (!roomMetadata) {
    return res.status(403).json({ msg: "you dont have access to this room" });
  }

  try {
    const parsedBarter = {
      user1_offers: JSON.parse(barter.user1_offers),
      user2_offers: JSON.parse(barter.user2_offers),
      state: barter.state,
      id: barter.id,
    };

    const response: BarterResponse = {
      id: parsedBarter.id,
      state: parsedBarter.state,
      localOffers:
        roomMetadata.user1 === uuid
          ? parsedBarter.user1_offers
          : parsedBarter.user2_offers,
      remoteOffers:
        roomMetadata.user1 === uuid
          ? parsedBarter.user2_offers
          : parsedBarter.user1_offers,
    };

    res.json({
      barter: response,
    });
  } catch (e) {
    console.error(e);
  }
});

router.post(
  "/active",
  extractUserId,
  ensureHasRoomAccess,
  ensureIsActiveBarter,
  async (req, res) => {
    // @ts-ignore
    const room: string = req.query.room;
    const updatedOffer = req.body.updatedOffer;
    // @ts-ignore
    const uuid: string = req.id!;

    const friendship = await getFriendshipById({ roomId: parseInt(room) });
    if (!friendship) {
      return res.status(411).json({});
    }
    const { user1, user2 } = friendship;
    const userIndex = uuid === user1 ? "1" : "2";

    // TODO: add validation atleast to updatedOffer.
    // At the very least do zod validation to ensure type of updatedOffer is correct
    const barter = await updateActiveBarter({
      roomId: room,
      userId: uuid,
      offers: JSON.stringify(updatedOffer),
      userIndex,
    });
    updateBarter(barter.id, { user1, user2 }, uuid, updatedOffer);

    res.json(barter);
  }
);

router.post(
  "/execute",
  extractUserId,
  ensureHasRoomAccess,
  ensureIsActiveBarter,
  async (req, res) => {
    // @ts-ignore
    const room: string = req.query.room;
    // @ts-ignore
    const userId: string = req.id;
    const barterId: number = req.body.barterId;
    // TODO: send contract txn here, maybe check that the DB state looks the same as the contract state before sending.
    // @ts-ignore
    const client_generated_uuid: string = req.body.clientGeneratedUuid;
    const friendship = await getFriendshipById({ roomId: parseInt(room) });
    if (!friendship) {
      return res.status(411).json({});
    }
    const { user1, user2 } = friendship;

    await executeActiveBarter({ roomId: room });
    await sendMessage({
      roomId: room,
      msg: {
        client_generated_uuid,
        message: `Barter`,
        message_kind: "barter",
        message_metadata: {
          on_chain_state: "", //TODO: store on chain data address/escrow index here
          barter_id: barterId,
          state: "executed",
        },
      },
      type: "individual",
      userId,
    });

    await executeBarterRealtime(barterId, { user1, user2 });

    res.json({});
  }
);

export default router;

import type { CollectionChatData, RemoteUserData } from "@coral-xyz/common";
import {
  AVATAR_BASE_URL,
  Blockchain,
  DEFAULT_GROUP_CHATS,
  WHITELISTED_CHAT_COLLECTIONS,
} from "@coral-xyz/common";
import express from "express";

import { ensureHasRoomAccess, extractUserId } from "../../auth/middleware";
import { getFriendshipStatus } from "../../db/friendships";
import {
  addNfts,
  getAllCollectionsFor,
  getAllUsers,
  getCollectionChatMetadata,
  getLastReadFor,
  getNftMembers,
} from "../../db/nft";
import { getUsersByPublicKeys } from "../../db/users";
import { getNftOwner, validateOwnership } from "../../utils/metaplex";

const router = express.Router();

router.post("/bulk", extractUserId, async (req, res) => {
  // @ts-ignore
  const userId: string = req.id;
  const nfts = req.body.nfts;
  const publicKey: string = req.body.publicKey;
  const users = await getUsersByPublicKeys([
    {
      blockchain: Blockchain.SOLANA,
      publicKey,
    },
  ]);
  if (users[0].user_id !== userId) {
    return res.status(403).json({
      msg: "User doesn't own this public key",
    });
  }

  const responses = await Promise.all(
    nfts.map(
      (nft: {
        nftId: string;
        collectionId: string;
        centralizedGroup: string;
      }) =>
        validateOwnership(
          nft.nftId,
          nft.collectionId,
          nft.centralizedGroup || nft.collectionId,
          publicKey
        )
    )
  );

  await addNfts(
    publicKey,
    nfts.filter((_x: any, index: number) => responses[index])
  );
  res.json({});
});

router.get("/bulk", extractUserId, async (req, res) => {
  // @ts-ignore
  const userId: string = req.id;

  //@ts-ignore
  const userSpecifiedId: string = req.query.uuid;

  if (userId !== userSpecifiedId) {
    return res.json({ collections: [] });
  }

  // TODO: optimise this
  const allCollections = await getAllCollectionsFor(userId);
  DEFAULT_GROUP_CHATS.forEach(({ id }: { id: string }) =>
    allCollections.push({ collection_id: id })
  );
  const lastReadMappings = await getLastReadFor(
    userId,
    allCollections.map((x) => x.centralized_group || x.collection_id)
  );
  const collectionChatMetadata = await getCollectionChatMetadata(
    allCollections.map((x) => x.centralized_group || x.collection_id)
  );

  const collections: CollectionChatData = allCollections.map(
    ({ collection_id: collectionId, centralized_group: centralizedGroup }) => ({
      collectionId: centralizedGroup || collectionId,
      lastReadMessage:
        lastReadMappings.find(
          (x) => x.collection_id === (centralizedGroup || collectionId)
        )?.last_read_message_id || null,
      lastMessage: collectionChatMetadata.find(
        (x) => x.collection_id === (centralizedGroup || collectionId)
      )?.last_message,
      lastMessageUuid: collectionChatMetadata.find(
        (x) => x.collection_id === (centralizedGroup || collectionId)
      )?.last_message_uuid,
      lastMessageTimestamp: collectionChatMetadata.find(
        (x) => x.collection_id === (centralizedGroup || collectionId)
      )?.last_message_timestamp,
      image:
        DEFAULT_GROUP_CHATS.find(
          (x) => x.id === (centralizedGroup || collectionId)
        )?.image ||
        WHITELISTED_CHAT_COLLECTIONS.find((x) => x.id === centralizedGroup)
          ?.image,
      name:
        DEFAULT_GROUP_CHATS.find(
          (x) => x.id === (centralizedGroup || collectionId)
        )?.name ||
        WHITELISTED_CHAT_COLLECTIONS.find((x) => x.id === centralizedGroup)
          ?.name,
    })
  );

  res.json({
    collections,
  });
});

router.get("/validateOwner", extractUserId, async (req, res) => {
  //@ts-ignore
  const mint: string = req.query.mint;
  //@ts-ignore
  const ownerUuid: string = req.query.ownerUuid;
  //@ts-ignore
  const blockchain: Blockchain = req.query.blockchain || "solana";

  const ownerPubkey = await getNftOwner(mint);

  if (!ownerPubkey) {
    console.error(`No owner found for nft ${ownerPubkey}`);
    res.json({
      isOwner: false,
    });
    return;
  }

  const users = await getUsersByPublicKeys([
    {
      blockchain,
      publicKey: ownerPubkey,
    },
  ]);

  if (users && users[0] && users[0].user_id === ownerUuid) {
    res.json({
      isOwner: true,
    });
    return;
  }

  res.json({
    isOwner: false,
  });
});

router.get("/members", extractUserId, ensureHasRoomAccess, async (req, res) => {
  // @ts-ignore
  const limit = Math.min(req.query.limit ? parseInt(req.query.limit) : 20, 100);
  // @ts-ignore
  const offset = req.query.offset ? parseInt(req.query.offset) : 0;
  // @ts-ignore
  const collectionId: string = req.query.room;
  // @ts-ignore
  const uuid: string = req.id;
  // @ts-ignore
  const prefix: string = req.query.prefix || "";

  const { count, users } = DEFAULT_GROUP_CHATS.map((x) => x.id).includes(
    collectionId
  )
    ? await getAllUsers(prefix, limit, offset)
    : await getNftMembers(collectionId, prefix, limit, offset);

  const memberFriendships: {
    id: string;
    areFriends: boolean;
    requested: boolean;
    remoteRequested: boolean;
  }[] = await getFriendshipStatus(
    users.map((x) => x.id as string),
    uuid
  );

  const members: RemoteUserData[] = users
    .filter((x) => x.id !== uuid)
    .map(({ id, username }) => {
      const friendship = memberFriendships.find((x) => x.id === id);

      return {
        id,
        username,
        image: `${AVATAR_BASE_URL}/${username}`,
        requested: friendship?.requested || false,
        remoteRequested: friendship?.remoteRequested || false,
        areFriends: friendship?.areFriends || false,
      };
    });

  res.json({
    members: members,
    count,
  });
});

export default router;

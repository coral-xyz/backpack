import type { CollectionChatData, RemoteUserData } from "@coral-xyz/common";
import {
  AVATAR_BASE_URL,
  Blockchain,
  DEFAULT_GROUP_CHATS,
} from "@coral-xyz/common";
import { WHITELISTED_CHAT_COLLECTIONS } from "@coral-xyz/common/src/constants";
import express from "express";

import { ensureHasRoomAccess, extractUserId } from "../../auth/middleware";
import { getFriendshipStatus } from "../../db/friendships";
import {
  addNfts,
  getAllCollectionsFor,
  getCollectionChatMetadata,
  getLastReadFor,
  getNftMembers,
} from "../../db/nft";
import { getUsersByPublicKeys } from "../../db/users";
import { validateOwnership } from "../../utils/metaplex";

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
          centralizedGroup,
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

  // TODO: optimise this
  const allCollections = await getAllCollectionsFor(userId);
  DEFAULT_GROUP_CHATS.forEach(({ id }: { id: string }) =>
    allCollections.push({ collection_id: id })
  );
  const lastReadMappings = await getLastReadFor(
    userId,
    allCollections.map((x) => x.collection_id)
  );
  const collectionChatMetadata = await getCollectionChatMetadata(
    allCollections.map((x) => x.collection_id)
  );

  const collections: CollectionChatData = allCollections.map(
    ({ collection_id: collectionId, centralized_group: centraliedGroup }) => ({
      collectionId,
      lastReadMessage:
        lastReadMappings.find((x) => x.collection_id === collectionId)
          ?.last_read_message_id || null,
      lastMessage: collectionChatMetadata.find(
        (x) => x.collection_id === collectionId
      )?.last_message,
      lastMessageUuid: collectionChatMetadata.find(
        (x) => x.collection_id === collectionId
      )?.last_message_uuid,
      lastMessageTimestamp: collectionChatMetadata.find(
        (x) => x.collection_id === collectionId
      )?.last_message_timestamp,
      image:
        DEFAULT_GROUP_CHATS.find((x) => x.id === collectionId)?.image ||
        WHITELISTED_CHAT_COLLECTIONS.find((x) => x.id === centraliedGroup)
          ?.image,
      name:
        DEFAULT_GROUP_CHATS.find((x) => x.id === collectionId)?.name ||
        WHITELISTED_CHAT_COLLECTIONS.find((x) => x.id === centraliedGroup)
          ?.name,
    })
  );

  res.json({
    collections,
  });
});

router.get("/members", extractUserId, ensureHasRoomAccess, async (req, res) => {
  // @ts-ignore
  const limit = req.query.limit ? parseInt(req.query.limit) : 20;
  // @ts-ignore
  const offset = req.query.offset ? parseInt(req.query.offset) : 0;
  // @ts-ignore
  const collectionId: string = req.query.room;
  // @ts-ignore
  const uuid: string = req.id;
  // @ts-ignore
  const prefix: string = req.query.prefix || "";

  const { count, users } = await getNftMembers(
    collectionId,
    prefix,
    limit,
    offset
  );

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

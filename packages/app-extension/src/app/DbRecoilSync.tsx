import { useEffect } from "react";
import {
  getNftCollectionGroups,
  useActiveChats,
  useRequestsCount,
} from "@coral-xyz/db";
import {
  friendships,
  groupCollections,
  requestCount,
  useUser,
} from "@coral-xyz/recoil";
import { useRecoilState } from "recoil";

export const DbRecoilSync = () => {
  const { uuid } = useUser();
  const activeChats = useActiveChats(uuid);
  const collectionsChatMetadata = getNftCollectionGroups(uuid);
  const count = useRequestsCount(uuid);
  const [friendshipValue, setFriendshipsValue] = useRecoilState(
    friendships({ uuid })
  );
  const [requestCountValue, setRequestCountValue] = useRecoilState(
    requestCount({ uuid })
  );
  const [groupCollectionsValue, setGroupCollectionsValue] = useRecoilState(
    groupCollections({ uuid })
  );

  useEffect(() => {
    if (JSON.stringify(friendshipValue) === JSON.stringify(activeChats)) {
      return;
    }
    setFriendshipsValue(activeChats);
  }, [uuid, activeChats, friendshipValue, setFriendshipsValue]);

  useEffect(() => {
    if (count !== requestCountValue) {
      setRequestCountValue(count || 0);
    }
  }, [count, requestCountValue, setRequestCountValue]);

  useEffect(() => {
    if (
      JSON.stringify(groupCollectionsValue) ===
      JSON.stringify(collectionsChatMetadata)
    ) {
      return;
    }
    setGroupCollectionsValue(collectionsChatMetadata || []);
  }, [collectionsChatMetadata, setGroupCollectionsValue]);

  return <></>;
};

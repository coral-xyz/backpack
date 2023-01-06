import { useEffect } from "react";
import { useActiveChats, useRequestsCount } from "@coral-xyz/db";
import { friendships,requestCount, useUser  } from "@coral-xyz/recoil";
import { useRecoilState } from "recoil";

export const DbRecoilSync = () => {
  const { uuid } = useUser();
  const activeChats = useActiveChats(uuid);
  const count = useRequestsCount(uuid);
  const [friendshipValue, setFriendshipsValue] = useRecoilState(
    friendships({ uuid })
  );
  const [requestCountValue, setRequestCountValue] = useRecoilState(
    requestCount({ uuid })
  );

  useEffect(() => {
    if (JSON.stringify(friendshipValue) === JSON.stringify(activeChats)) {
      return;
    }
    setFriendshipsValue(activeChats);
  }, [uuid, activeChats, friendshipValue, setFriendshipsValue]);

  useEffect(() => {
    console.error("count is ");
    console.error(count);
    if (count !== requestCountValue) {
      setRequestCountValue(count || 0);
    }
  }, [count, requestCountValue, setRequestCountValue]);

  return <></>;
};

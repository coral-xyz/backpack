import { useRecoilValue } from "recoil";

import { friendship, friendships, requestCount } from "../";

export function useFriendship({ userId }: { userId: string }): any {
  return useRecoilValue(friendship({ userId }));
}

export function useFriendships({ uuid }: { uuid: string }): any {
  return useRecoilValue(friendships({ uuid }));
}

export function useRequestsCount({ uuid }: { uuid: string }): any {
  return useRecoilValue(requestCount({ uuid }));
}

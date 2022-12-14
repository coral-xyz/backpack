import { useRecoilValue } from "recoil";

import { friendship } from "../";

export function useFriendship({ userId }: { userId: string }): any {
  return useRecoilValue(friendship({ userId }));
}

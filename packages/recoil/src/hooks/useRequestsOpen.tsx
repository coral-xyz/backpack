import { useRecoilValue } from "recoil";

import { requestsOpen } from "../atoms/requestsOpen";

export const useRequestsOpen = () => {
  return useRecoilValue(requestsOpen);
};

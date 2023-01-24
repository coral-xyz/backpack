import { useRecoilValue } from "recoil";

import { groupCollections } from "../atoms";

export const useFeatureGates = ({ uuid }: { uuid: string }) => {
  return useRecoilValue(groupCollections({ uuid }));
};

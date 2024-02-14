import { useRecoilValueLoadable } from "recoil";

import { appStoreMetaTags } from "../../atoms";

export function useAppStoreMetaLoadable(xnft: string) {
  return useRecoilValueLoadable(appStoreMetaTags(xnft));
}

import { createContext, type PropsWithChildren, useContext } from "react";
import type { Nft as LegacyNft } from "@coral-xyz/common";

import type { CollectibleGroup, ResponseCollectible } from "./utils";

export type CollectiblesContextType = {
  onCardClick: (group: CollectibleGroup) => void | Promise<void>;
  onOpenSendDrawer?: (nft: ResponseCollectible) => void | Promise<void>;
  onViewClick: (nft: ResponseCollectible) => void | Promise<void>;
  showItemCount?: boolean;
};

const defaultValue: CollectiblesContextType = {
  onCardClick: (_group) => {},
  onOpenSendDrawer: (_nft) => {},
  onViewClick: (_nft) => {},
  showItemCount: false,
};

const CollectiblesContext =
  createContext<CollectiblesContextType>(defaultValue);

export function useCollectiblesContext(): CollectiblesContextType {
  return useContext(CollectiblesContext);
}

export function CollectiblesProvider({
  children,
  ...rest
}: PropsWithChildren<CollectiblesContextType>) {
  return (
    <CollectiblesContext.Provider value={rest}>
      {children}
    </CollectiblesContext.Provider>
  );
}

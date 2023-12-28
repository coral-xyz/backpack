import { type ReactNode, Suspense } from "react";

import { CollectibleList } from "./CollectibleList";
import { type CollectiblesContextType, CollectiblesProvider } from "./context";
import type { CollectibleGroup } from "./utils";

export type CollectibleGroupViewProps = {
  data: CollectibleGroup[];
  loaderComponent?: ReactNode;
  onCardClick: CollectiblesContextType["onCardClick"];
  onViewClick: CollectiblesContextType["onViewClick"];
};

export const CollectibleGroupView = ({
  loaderComponent,
  ...rest
}: CollectibleGroupViewProps) => (
  <Suspense fallback={loaderComponent}>
    <_CollectibleGroupView {...rest} />
  </Suspense>
);

function _CollectibleGroupView({
  data,
  onCardClick,
  onViewClick,
}: Omit<CollectibleGroupViewProps, "loaderComponent">) {
  return (
    <CollectiblesProvider onCardClick={onCardClick} onViewClick={onViewClick}>
      <CollectibleList collectibleGroups={data} />
    </CollectiblesProvider>
  );
}

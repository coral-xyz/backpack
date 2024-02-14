import { CollectibleGroupView } from "../../../../components/Unlocked/Collectibles";
import { ScreenContainer } from "../../../components/ScreenContainer";
import type { CollectiblesCollectionScreenProps } from "../../../navigation/WalletsNavigator";

export function CollectiblesCollectionScreen(
  props: CollectiblesCollectionScreenProps
) {
  return (
    <ScreenContainer loading={<Loading />}>
      <Container {...props} />
    </ScreenContainer>
  );
}

function Loading() {
  // TODO.
  return null;
}

function Container({ route: { params } }: CollectiblesCollectionScreenProps) {
  return <CollectibleGroupView {...params} />;
}

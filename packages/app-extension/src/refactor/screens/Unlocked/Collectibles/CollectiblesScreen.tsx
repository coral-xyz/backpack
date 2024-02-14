import { Collectibles } from "../../../../components/Unlocked/Collectibles";
import { ScreenContainer } from "../../../components/ScreenContainer";
import { useMountOnFocusWallet } from "../../../hooks/useMountOnFocus";
import type { CollectiblesScreenProps } from "../../../navigation/TabsNavigator";

export function CollectiblesScreen(_props: CollectiblesScreenProps) {
  return useMountOnFocusWallet(
    <ScreenContainer loading={<Loading />}>
      <Container />
    </ScreenContainer>,
    <Loading />
  );
}

function Loading() {
  // TODO.
  return null;
}

function Container() {
  return <Collectibles />;
}

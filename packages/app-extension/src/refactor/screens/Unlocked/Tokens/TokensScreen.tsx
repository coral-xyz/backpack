import { TokenBalances } from "../../../../components/Unlocked/TokenBalances";
import { ScreenContainer } from "../../../components/ScreenContainer";
import { useMountOnFocusWallet } from "../../../hooks/useMountOnFocus";
import type { TokensScreenProps } from "../../../navigation/TabsNavigator";

export function TokensScreen(_props: TokensScreenProps) {
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
  return <TokenBalances />;
}

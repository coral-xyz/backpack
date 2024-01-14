import { useActiveWallet } from "@coral-xyz/recoil";

import { Transactions } from "../../../../components/Unlocked/Transactions";
import { ScreenContainer } from "../../../components/ScreenContainer";
import { useMountOnFocusWallet } from "../../../hooks/useMountOnFocus";
import type { ActivityScreenProps } from "../../../navigation/TabsNavigator";

export function ActivityScreen(_props: ActivityScreenProps) {
  return useMountOnFocusWallet(
    <ScreenContainer loading={<Loading />} noScrollbar>
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
  const activeWallet = useActiveWallet();
  return <Transactions ctx={activeWallet} />;
}

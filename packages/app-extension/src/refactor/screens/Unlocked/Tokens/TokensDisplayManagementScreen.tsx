import { useActiveWallet } from "@coral-xyz/recoil";

import { TokenDisplayManagement } from "../../../../components/Unlocked/TokenBalances/TokenDisplayManagementDrawer";
import { ScreenContainer } from "../../../components/ScreenContainer";
import type { TokensDisplayManagementScreenProps } from "../../../navigation/WalletsNavigator";

export function TokensDisplayManagementScreen(
  props: TokensDisplayManagementScreenProps
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

function Container(_props: TokensDisplayManagementScreenProps) {
  const { publicKey, blockchain } = useActiveWallet();
  return <TokenDisplayManagement address={publicKey} blockchain={blockchain} />;
}

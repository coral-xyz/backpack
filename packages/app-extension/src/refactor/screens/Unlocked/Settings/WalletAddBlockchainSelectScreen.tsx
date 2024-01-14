import { WalletListBlockchainSelector } from "../../../../components/common/WalletList";
import { ScreenContainer } from "../../../components/ScreenContainer";
import type {
  Routes,
  SettingsScreenProps,
} from "../../../navigation/SettingsNavigator";

export function WalletAddBlockchainSelectScreen(
  props: SettingsScreenProps<Routes.WalletAddBlockchainSelectScreen>
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

function Container(
  _props: SettingsScreenProps<Routes.WalletAddBlockchainSelectScreen>
) {
  return <WalletListBlockchainSelector />;
}

import { ImportMnemonicAutomatic } from "../../../../components/Unlocked/Settings/AddConnectWallet/ImportMnemonic";
import { ScreenContainer } from "../../../components/ScreenContainer";
import type {
  Routes,
  SettingsScreenProps,
} from "../../../navigation/SettingsNavigator";

export function WalletSetMnemonicScreen(
  props: SettingsScreenProps<Routes.WalletSetMnemonicScreen>
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

function Container({
  route: {
    params: { blockchain },
  },
}: SettingsScreenProps<Routes.WalletSetMnemonicScreen>) {
  return <ImportMnemonicAutomatic blockchain={blockchain} />;
}

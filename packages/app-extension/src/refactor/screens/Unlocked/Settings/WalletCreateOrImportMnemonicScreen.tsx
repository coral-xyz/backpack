import { CreateOrImportMnemonic } from "../../../../components/Unlocked/Settings/AddConnectWallet/CreateMnemonic";
import { ScreenContainer } from "../../../components/ScreenContainer";
import type {
  Routes,
  SettingsScreenProps,
} from "../../../navigation/SettingsNavigator";

export function WalletCreateOrImportMnemonicScreen(
  props: SettingsScreenProps<Routes.WalletCreateOrImportMnemonicScreen>
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
}: SettingsScreenProps<Routes.WalletCreateOrImportMnemonicScreen>) {
  return <CreateOrImportMnemonic blockchain={blockchain} />;
}

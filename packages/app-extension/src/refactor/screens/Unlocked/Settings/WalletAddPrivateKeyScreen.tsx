import { ImportSecretKey } from "../../../../components/Unlocked/Settings/AddConnectWallet/ImportSecretKey";
import { ScreenContainer } from "../../../components/ScreenContainer";
import type {
  Routes,
  SettingsScreenProps,
} from "../../../navigation/SettingsNavigator";

export function WalletAddPrivateKeyScreen(
  props: SettingsScreenProps<Routes.WalletAddPrivateKeyScreen>
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
}: SettingsScreenProps<Routes.WalletAddPrivateKeyScreen>) {
  return <ImportSecretKey blockchain={blockchain} />;
}

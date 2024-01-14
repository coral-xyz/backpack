import { ImportMenu } from "../../../../components/Unlocked/Settings/AddConnectWallet/ImportMenu";
import { ScreenContainer } from "../../../components/ScreenContainer";
import type {
  Routes,
  SettingsScreenProps,
} from "../../../navigation/SettingsNavigator";

export function WalletAddAdvancedScreen(
  props: SettingsScreenProps<Routes.WalletAddAdvancedScreen>
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
}: SettingsScreenProps<Routes.WalletAddAdvancedScreen>) {
  return <ImportMenu blockchain={blockchain} />;
}

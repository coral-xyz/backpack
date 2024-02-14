import { AddWalletMenu } from "../../../../components/Unlocked/Settings/AddConnectWallet";
import { ScreenContainer } from "../../../components/ScreenContainer";
import type {
  Routes,
  SettingsScreenProps,
} from "../../../navigation/SettingsNavigator";

export function WalletAddScreen(
  props: SettingsScreenProps<Routes.WalletAddScreen>
) {
  return (
    <ScreenContainer loading={<Loading />}>
      <Container {...props} />
    </ScreenContainer>
  );
}

function Loading() {
  return null;
}

function Container({
  route: {
    params: { blockchain },
  },
}: SettingsScreenProps<Routes.WalletAddScreen>) {
  return <AddWalletMenu blockchain={blockchain} />;
}

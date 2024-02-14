import { RemoveWallet } from "../../../../components/Unlocked/Settings/YourAccount/EditWallets/RemoveWallet";
import { ScreenContainer } from "../../../components/ScreenContainer";
import type {
  Routes,
  SettingsScreenProps,
} from "../../../navigation/SettingsNavigator";

export function WalletRemoveScreen(
  props: SettingsScreenProps<Routes.WalletRemoveScreen>
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
  route: { params },
}: SettingsScreenProps<Routes.WalletRemoveScreen>) {
  return <RemoveWallet {...params} />;
}

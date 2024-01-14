import { RenameWallet } from "../../../../components/Unlocked/Settings/YourAccount/EditWallets/RenameWallet";
import { ScreenContainer } from "../../../components/ScreenContainer";
import type {
  Routes,
  SettingsScreenProps,
} from "../../../navigation/SettingsNavigator";

export function WalletRenameScreen(
  props: SettingsScreenProps<Routes.WalletRenameScreen>
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
}: SettingsScreenProps<Routes.WalletRenameScreen>) {
  return <RenameWallet {...params} />;
}

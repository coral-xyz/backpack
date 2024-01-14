import { WalletDetail } from "../../../../components/Unlocked/Settings/YourAccount/EditWallets/WalletDetail";
import { ScreenContainer } from "../../../components/ScreenContainer";
import type {
  Routes,
  SettingsScreenProps,
} from "../../../navigation/SettingsNavigator";

export function WalletDetailScreen(
  props: SettingsScreenProps<Routes.WalletDetailScreen>
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
}: SettingsScreenProps<Routes.WalletDetailScreen>) {
  return <WalletDetail {...params} />;
}

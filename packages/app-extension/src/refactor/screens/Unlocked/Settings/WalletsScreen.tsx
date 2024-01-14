import { AllWalletsListStack } from "../../../../components/common/WalletList";
import { ScreenContainer } from "../../../components/ScreenContainer";
import type {
  Routes,
  SettingsScreenProps,
} from "../../../navigation/SettingsNavigator";

export function WalletsScreen(
  props: SettingsScreenProps<Routes.WalletsScreen>
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

function Container(_props: SettingsScreenProps<Routes.WalletsScreen>) {
  return <AllWalletsListStack isStack />;
}

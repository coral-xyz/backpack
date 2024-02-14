import { PreferencesBlockchainExplorer } from "../../../../components/Unlocked/Settings/Preferences/Blockchains/Explorer";
import { ScreenContainer } from "../../../components/ScreenContainer";
import type {
  Routes,
  SettingsScreenProps,
} from "../../../navigation/SettingsNavigator";

export function PreferencesBlockchainExplorerScreen(
  props: SettingsScreenProps<Routes.PreferencesBlockchainExplorerScreen>
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
}: SettingsScreenProps<Routes.PreferencesBlockchainExplorerScreen>) {
  return <PreferencesBlockchainExplorer blockchain={blockchain} />;
}

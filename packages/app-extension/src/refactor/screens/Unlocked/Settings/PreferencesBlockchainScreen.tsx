import { PreferencesBlockchain } from "../../../../components/Unlocked/Settings/Preferences/Blockchains";
import { ScreenContainer } from "../../../components/ScreenContainer";
import type {
  Routes,
  SettingsScreenProps,
} from "../../../navigation/SettingsNavigator";

export function PreferencesBlockchainScreen(
  props: SettingsScreenProps<Routes.PreferencesBlockchainScreen>
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
}: SettingsScreenProps<Routes.PreferencesBlockchainScreen>) {
  return <PreferencesBlockchain blockchain={blockchain} />;
}

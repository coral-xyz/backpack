import { PreferencesBlockchainConnection } from "../../../../components/Unlocked/Settings/Preferences/Blockchains/ConnectionSwitch";
import { ScreenContainer } from "../../../components/ScreenContainer";
import type {
  Routes,
  SettingsScreenProps,
} from "../../../navigation/SettingsNavigator";

export function PreferencesBlockchainRpcConnectionScreen(
  props: SettingsScreenProps<Routes.PreferencesBlockchainRpcConnectionScreen>
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
}: SettingsScreenProps<Routes.PreferencesBlockchainRpcConnectionScreen>) {
  return <PreferencesBlockchainConnection blockchain={blockchain} />;
}

import { PreferenceBlockchainCustomRpcUrl } from "../../../../components/Unlocked/Settings/Preferences/Blockchains/CustomRpcUrl";
import { ScreenContainer } from "../../../components/ScreenContainer";
import type {
  Routes,
  SettingsScreenProps,
} from "../../../navigation/SettingsNavigator";

export function PreferencesBlockchainRpcConnectionCustomScreen(
  props: SettingsScreenProps<Routes.PreferencesBlockchainRpcConnectionCustomScreen>
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
}: SettingsScreenProps<Routes.PreferencesBlockchainRpcConnectionCustomScreen>) {
  return <PreferenceBlockchainCustomRpcUrl blockchain={blockchain} />;
}

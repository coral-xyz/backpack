import { PreferencesBlockchainCommitment } from "../../../../components/Unlocked/Settings/Preferences/Blockchains/Commitment";
import { ScreenContainer } from "../../../components/ScreenContainer";
import type {
  Routes,
  SettingsScreenProps,
} from "../../../navigation/SettingsNavigator";

export function PreferencesBlockchainCommitmentScreen(
  props: SettingsScreenProps<Routes.PreferencesBlockchainCommitmentScreen>
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
}: SettingsScreenProps<Routes.PreferencesBlockchainCommitmentScreen>) {
  return <PreferencesBlockchainCommitment blockchain={blockchain} />;
}

import { Preferences } from "../../../../components/Unlocked/Settings/Preferences";
import { ScreenContainer } from "../../../components/ScreenContainer";
import type {
  Routes,
  SettingsScreenProps,
} from "../../../navigation/SettingsNavigator";

export function PreferencesScreen(
  props: SettingsScreenProps<Routes.PreferencesScreen>
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

function Container(_props: SettingsScreenProps<Routes.PreferencesScreen>) {
  return <Preferences />;
}

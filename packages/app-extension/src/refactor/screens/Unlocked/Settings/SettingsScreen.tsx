import { _SettingsContent } from "../../../../components/Unlocked/Settings";
import { ScreenContainer } from "../../../components/ScreenContainer";
import type {
  Routes,
  SettingsScreenProps,
} from "../../../navigation/SettingsNavigator";

export function SettingsScreen(
  _props: SettingsScreenProps<Routes.SettingsScreen>
) {
  return (
    <ScreenContainer loading={<Loading />}>
      <Container />
    </ScreenContainer>
  );
}

function Loading() {
  // TODO.
  return null;
}

function Container() {
  return <_SettingsContent />;
}

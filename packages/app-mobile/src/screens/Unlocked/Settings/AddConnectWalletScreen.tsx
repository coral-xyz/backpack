import { Screen } from "@components";
import {
  useBackgroundClient,
  // useBlockchainLogo,
  // useDarkMode,
  // useDeveloperMode,
} from "@coral-xyz/recoil";
import { useTheme } from "@hooks";

export default function AccountPreferencesScreen({ navigation }) {
  const background = useBackgroundClient();
  const theme = useTheme();

  const onDeveloperModeSwitch = async (isDeveloperMode: boolean) => {
    await background.request({
      method: UI_RPC_METHOD_SETTINGS_DEVELOPER_MODE_UPDATE,
      params: [isDeveloperMode],
    });
  };

  return <Screen style={{ padding: 12 }}></Screen>;
}

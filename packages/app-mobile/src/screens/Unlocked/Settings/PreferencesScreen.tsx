import { Screen, Margin } from "@components";
import {
  BACKPACK_CONFIG_VERSION,
  BACKPACK_FEATURE_LIGHT_MODE,
  Blockchain,
  UI_RPC_METHOD_SETTINGS_DARK_MODE_UPDATE,
  UI_RPC_METHOD_SETTINGS_DEVELOPER_MODE_UPDATE,
} from "@coral-xyz/common";
import {
  useBackgroundClient,
  // useBlockchainLogo,
  useDarkMode,
  useDeveloperMode,
} from "@coral-xyz/recoil";

import {
  IconLeft,
  IconPushDetail,
  RoundedContainer,
  SettingsRow,
  SettingsRowSwitch,
  SettingsRowText,
} from "./components/SettingsRow";

export function PreferencesScreen({ navigation }) {
  // const theme = useTheme();
  const background = useBackgroundClient();
  const isDarkMode = useDarkMode();
  const isDeveloperMode = useDeveloperMode();

  const onDarkModeSwitch = async (isDarkMode: boolean) => {
    await background.request({
      method: UI_RPC_METHOD_SETTINGS_DARK_MODE_UPDATE,
      params: [isDarkMode],
    });
  };

  const onDeveloperModeSwitch = async (isDeveloperMode: boolean) => {
    await background.request({
      method: UI_RPC_METHOD_SETTINGS_DEVELOPER_MODE_UPDATE,
      params: [isDeveloperMode],
    });
  };

  return (
    <Screen>
      <Margin vertical={12}>
        <RoundedContainer>
          <SettingsRow
            label="Auto-lock Timer"
            onPress={() => navigation.push("Preferences")}
            detailIcon={<IconPushDetail />}
          />
          <SettingsRow
            label="Trusted Sites"
            onPress={() => navigation.push("Preferences")}
            detailIcon={<IconPushDetail />}
          />
          <SettingsRowSwitch
            value={isDarkMode}
            label="Dark Mode"
            onPress={(value) => onDarkModeSwitch(value)}
          />
          <SettingsRowSwitch
            value={isDeveloperMode}
            label="Developer Mode"
            onPress={(value) => onDeveloperModeSwitch(value)}
          />
        </RoundedContainer>
      </Margin>
      <Margin bottom={12}>
        <RoundedContainer>
          <SettingsRow
            label={Blockchain.SOLANA}
            detailIcon={<IconPushDetail />}
            onPress={() =>
              navigation.push("Preferences", { blockchain: Blockchain.SOLANA })
            }
          />
          <SettingsRow
            label={Blockchain.ETHEREUM}
            detailIcon={<IconPushDetail />}
            onPress={() =>
              navigation.push("Preferences", {
                blockchain: Blockchain.ETHEREUM,
              })
            }
          />
        </RoundedContainer>
      </Margin>
      <Margin bottom={12}>
        <RoundedContainer>
          <SettingsRowText
            label="Version"
            detailText={BACKPACK_CONFIG_VERSION}
          />
        </RoundedContainer>
      </Margin>
    </Screen>
  );
}

import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { UI_RPC_METHOD_KEYRING_EXPORT_SECRET_KEY } from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { MaterialIcons } from "@expo/vector-icons";

import { EyeIcon, WarningIcon } from "~components/Icon";
import {
  CopyButton,
  DangerButton,
  Header,
  HeaderIconSubtitle,
  Margin,
  Screen,
  SecondaryButton,
  StyledTextInput,
} from "~components/index";
import { useTheme } from "~hooks/useTheme";

export function ShowPrivateKeyWarningScreen({
  route,
  navigation,
}): JSX.Element {
  const { publicKey } = route.params;
  const theme = useTheme();
  const background = useBackgroundClient();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handlePressConfirm = async () => {
    let privateKey;
    try {
      privateKey = await background.request({
        method: UI_RPC_METHOD_KEYRING_EXPORT_SECRET_KEY,
        params: [password, publicKey],
      });
    } catch (e) {
      console.error(e);
      setError(true);
      return;
    }

    navigation.push("show-private-key", { privateKey });
  };

  const warnings = [
    {
      icon: "chat",
      text: "Backpack support will never ask for your private key.",
    },
    {
      icon: "web",
      text: "Never share your private key or enter it into an app or website.",
    },
    {
      icon: "lock",
      text: "Anyone with your private key will have complete control of your account.",
    },
  ];

  return (
    <Screen style={{ justifyContent: "space-between" }}>
      <View>
        <View style={styles.header}>
          <Margin bottom={16}>
            <WarningIcon color="#E95050" />
          </Margin>
          <Header text="Warning" />
        </View>
        {warnings.map(({ icon, text }) => (
          <View
            key={text}
            style={[
              {
                backgroundColor: theme.custom.colors.nav,
                borderColor: theme.custom.colors.borderFull,
              },
              styles.listContainer,
            ]}
          >
            <Margin right={12}>
              <MaterialIcons name={icon} size={24} color="#E95050" />
            </Margin>
            <Text
              style={[
                {
                  color: theme.custom.colors.fontColor,
                },
                styles.listItem,
              ]}
            >
              {text}
            </Text>
          </View>
        ))}
      </View>
      <View>
        <Margin bottom={8}>
          <StyledTextInput
            autoFocus
            value={password}
            onChangeText={(text: string) => setPassword(text)}
            // error={error}
            placeholder="Password"
            secureTextEntry
          />
        </Margin>
        <DangerButton
          label="Show private key"
          disabled={password.length < 8}
          onPress={handlePressConfirm}
        />
      </View>
    </Screen>
  );
}

export function ShowPrivateKeyScreen({ route, navigation }): JSX.Element {
  const { privateKey } = route.params;

  const handlePressClose = () => {
    navigation.goBack();
  };

  return (
    <Screen
      style={{
        justifyContent: "space-between",
      }}
    >
      <View>
        <HeaderIconSubtitle
          icon={<EyeIcon />}
          title="Private key"
          subtitle="Never give out your private key"
        />
        <Margin top={16}>
          <Margin bottom={12}>
            <StyledTextInput
              style={{ height: 100 }}
              multiline
              value={privateKey}
              editable={false}
            />
          </Margin>
          <CopyButton text={privateKey} />
        </Margin>
      </View>
      <SecondaryButton label="Close" onPress={handlePressClose} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    // alignSelf: "center",
    marginBottom: 24,
  },
  listContainer: {
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    marginBottom: 12,
    borderWidth: 1,
  },
  listItem: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
});

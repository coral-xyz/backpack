import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  CopyButton,
  DangerButton,
  Header,
  Margin,
  MnemonicInputFields,
  Screen,
  SecondaryButton,
  StyledTextInput,
  SubtextParagraph,
} from "@components";
import { ContentCopyIcon,EyeIcon, WarningIcon } from "@components/Icon";
import { UI_RPC_METHOD_KEYRING_EXPORT_MNEMONIC } from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@hooks";

export function ShowRecoveryPhraseWarningScreen({ navigation }): JSX.Element {
  const theme = useTheme();
  const background = useBackgroundClient();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handlePressShowPhrase = async () => {
    let mnemonic;
    try {
      mnemonic = await background.request({
        method: UI_RPC_METHOD_KEYRING_EXPORT_MNEMONIC,
        params: [password],
      });
    } catch (e) {
      console.error(e);
      setError(true);
      return;
    }

    navigation.push("show-secret-phrase", { mnemonic });
  };

  const warnings = [
    {
      icon: "chat",
      text: "Backpack support will never ask for your secret phrase.",
    },
    {
      icon: "web",
      text: "Never share your secret phrase or enter it into an app or website.",
    },
    {
      icon: "lock",
      text: "Anyone with your secret phrase will have complete control of your account.",
    },
  ];

  return (
    <Screen style={{ justifyContent: "space-between" }}>
      <View>
        <View style={styles.header}>
          <Margin bottom={16}>
            <WarningIcon fill="#E95050" />
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
            autoFocus={true}
            value={password}
            onChangeText={(text: string) => setPassword(text)}
            // error={error}
            placeholder={"Password"}
            secureTextEntry={true}
          />
        </Margin>
        <DangerButton
          label="Show phrase"
          disabled={password.length < 8}
          onPress={handlePressShowPhrase}
        />
      </View>
    </Screen>
  );
}

export function ShowRecoveryPhraseScreen({ route, navigation }): JSX.Element {
  const { mnemonic } = route.params;
  const mnemonicWords = mnemonic.split(" ");

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
        <View style={styles.header}>
          <Margin bottom={16}>
            <EyeIcon />
          </Margin>
          <Header text="Recovery phrase" style={{ textAlign: "center" }} />
          <SubtextParagraph>
            Use these {mnemonicWords.length} words to recover your wallet
          </SubtextParagraph>
        </View>
        <MnemonicInputFields mnemonicWords={mnemonicWords} />
        <Margin top={16}>
          <CopyButton text={mnemonic} />
        </Margin>
      </View>
      <SecondaryButton label="Close" onPress={handlePressClose} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignSelf: "center",
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

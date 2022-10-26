import {
  Header,
  PrimaryButton,
  Screen,
  StyledText,
  SubtextParagraph,
  MnemonicInputFields,
} from "@components";
import {
  UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE,
  UI_RPC_METHOD_KEYRING_VALIDATE_MNEMONIC,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { useTheme } from "@hooks/useTheme";
import { createStackNavigator } from "@react-navigation/stack";
import { useEffect, useState } from "react";
import { Button, Pressable, StyleSheet, Text, View } from "react-native";

const Stack = createStackNavigator();

function OnboardingScreen({ title, subtitle, children }) {
  return (
    <Screen style={{ padding: 24 }}>
      <View style={{ marginBottom: 12 }}>
        <Header text={title} />
        <SubtextParagraph>{subtitle}</SubtextParagraph>
      </View>
      {children}
    </Screen>
  );
}

// https://github.com/gorhom/react-native-bottom-sheet
function WelcomeScreen({ navigation }) {
  return (
    <Screen style={styles.container}>
      <View style={{ alignItems: "center" }}>
        <StyledText style={{ fontSize: 24, marginBottom: 12 }}>
          Backpack
        </StyledText>
        <StyledText>A home for your xNFTs</StyledText>
      </View>
      <View
        style={{
          padding: 12,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Button
          title="Create a new wallet"
          onPress={() => {
            navigation.push("SelectBlockchain", {
              readOnly: true,
            });
          }}
        />
        <Button
          title="Import an existing wallet"
          onPress={() => {
            navigation.push("SelectBlockchain", {
              readOnly: false,
            });
          }}
        />
      </View>
    </Screen>
  );
}

function OnboardingBlockchainSelectScreen({ route, navigation }) {
  const NETWORKS = [
    {
      name: "Ethereum",
      enabled: true,
    },
    {
      name: "Solana",
      enabled: true,
    },
    {
      name: "Polygon",
      enabled: false,
    },
    {
      name: "BSC",
      enabled: false,
    },
    {
      name: "Avalanche",
      enabled: false,
    },
    {
      name: "Cosmos",
      enabled: false,
    },
  ];

  function Network({ blockchain, enabled, onSelect }) {
    return (
      <View style={{ padding: 8, height: 50 }}>
        <Pressable onPress={() => enabled && onSelect(blockchain.name)}>
          <Text style={{ color: "#FFF" }}>{blockchain.name}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <OnboardingScreen
      title="Which network would you like Backpack to use?"
      subtitle="You can always add additional networks later through the settings menu."
    >
      {NETWORKS.map((blockchain) => (
        <Network
          enabled={blockchain.enabled}
          blockchain={blockchain}
          onSelect={(blockchain) => {
            navigation.push("MnemonicInput", {
              readOnly: route.params.readOnly,
              blockchain: blockchain.name,
            });
          }}
        />
      ))}
    </OnboardingScreen>
  );
}

// Create Wallet: readonly = false; Import Wallet: readOnly = true;
function OnboardingMnemonicInputScreen({ route, navigation }) {
  const { readOnly } = route.params;

  const background = useBackgroundClient();
  const [mnemonicWords, setMnemonicWords] = useState<string[]>([
    ...Array(12).fill(""),
  ]);

  const [error, setError] = useState<string>();
  const [checked, setChecked] = useState(false);

  const mnemonic = mnemonicWords.map((f) => f.trim()).join(" ");
  // Only enable copy all fields populated
  const copyEnabled = mnemonicWords.find((w) => w.length < 3) === undefined;
  // Only allow next if checkbox is checked in read only and all fields are populated
  const nextEnabled = (!readOnly || checked) && copyEnabled;

  const subtitle = readOnly
    ? "This is the only way to recover your account if you lose your device. Write it down and store it in a safe place."
    : "Enter your 12 or 24-word secret recovery mnemonic to add an existing wallet.";

  //
  // Handle pastes of 12 or 24 word mnemonics.
  //
  useEffect(() => {
    // const onPaste = (e: any) => {
    //   const words = e.clipboardData.getData("text").split(" ");
    //   if (words.length !== 12 && words.length !== 24) {
    //     // Not a valid mnemonic length
    //     return;
    //   }
    //   // Prevent the paste from populating an individual input field with
    //   // all words
    //   e.preventDefault();
    //   setMnemonicWords(words);
    // };
    if (!readOnly) {
      // Enable pasting if not readonly
      // window.addEventListener("paste", onPaste);
    } else {
      // If read only we can generate a random mnemnic
      generateRandom();
    }
    return () => {
      if (!readOnly) {
        // window.removeEventListener("paste", onPaste);
      }
    };
  }, []);

  //
  // Validate the mnemonic and call the onNext handler.
  //
  const next = () => {
    background
      .request({
        method: UI_RPC_METHOD_KEYRING_VALIDATE_MNEMONIC,
        params: [mnemonic],
      })
      .then((isValid: boolean) => {
        return isValid
          ? navigation.push("ImportAccounts")
          : setError("Invalid secret recovery phrase");
      });
  };

  //
  // Generate a random mnemonic and populate state.
  //
  const generateRandom = () => {
    background
      .request({
        method: UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE,
        params: [mnemonicWords.length === 12 ? 128 : 256],
      })
      .then((m: string) => {
        const words = m.split(" ");
        setMnemonicWords(words);
      });
  };

  return (
    <OnboardingScreen title="Secret recovery phrase" subtitle={subtitle}>
      <MnemonicInputFields
        mnemonicWords={mnemonicWords}
        onChange={readOnly ? undefined : setMnemonicWords}
      />
      {readOnly ? null : (
        // TODO Text-styled Button (Link)
        <StyledText>
          Use a {mnemonicWords.length === 12 ? "24" : "12"}-word recovery
          mnemonic
        </StyledText>
      )}
      {readOnly ? (
        // TODO CheckboxForm
        <Button
          title="I saved my secret recovery phrase"
          onPress={() => {
            setChecked(!checked);
          }}
        />
      ) : null}
      <PrimaryButton disabled={!nextEnabled} label="Import" onPress={next} />
    </OnboardingScreen>
  );
}

function OnboardingImportAccountsScreen({ navigation }) {
  return (
    <Screen style={styles.container}>
      <View>
        <StyledText style={{ fontSize: 24, marginBottom: 12 }}>
          Secret Recovery Phrase
        </StyledText>
      </View>
      <View style={{ flexDirection: "row" }}>
        <PrimaryButton
          label="Import Accounts"
          onPress={() => {
            navigation.push("CreatePassword");
          }}
        />
      </View>
    </Screen>
  );
}

function OnboardingCreatePasswordScreen({ navigation }) {
  return (
    <Screen style={styles.container}>
      <View>
        <StyledText style={{ fontSize: 24, marginBottom: 12 }}>
          Secret Recovery Phrase
        </StyledText>
      </View>
      <View style={{ flexDirection: "row" }}>
        <PrimaryButton
          label="Next"
          onPress={() => {
            navigation.push("Complete");
          }}
        />
      </View>
    </Screen>
  );
}

function OnboardingCompleteScreen({ navigation }) {
  return (
    <Screen style={styles.container}>
      <View>
        <StyledText style={{ fontSize: 24, marginBottom: 12 }}>
          Finished
        </StyledText>
      </View>
      <View style={{ flexDirection: "row" }}>
        <PrimaryButton
          label="Finish"
          onPress={() => {
            navigation.navigate("Welcome");
          }}
        />
      </View>
    </Screen>
  );
}

export default function OnboardingNavigator() {
  const theme = useTheme();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Group
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.fontColor,
          headerTitle: "",
          headerShown: true,
          headerBackTitleVisible: false,
        }}
      >
        <Stack.Screen
          name="SelectBlockchain"
          component={OnboardingBlockchainSelectScreen}
        />
        <Stack.Screen
          name="MnemonicInput"
          component={OnboardingMnemonicInputScreen}
        />
        <Stack.Screen
          name="ImportAccounts"
          component={OnboardingImportAccountsScreen}
        />
        <Stack.Screen
          name="CreatePassword"
          component={OnboardingCreatePasswordScreen}
        />
        <Stack.Screen name="Complete" component={OnboardingCompleteScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
    paddingTop: 24,
  },
});

import {
  Header,
  MnemonicInputFields,
  PrimaryButton,
  Screen,
  StyledText,
  SubtextParagraph,
} from "@components";
import { CheckBox } from "@components/CheckBox";
import { CustomButton } from "@components/CustomButton";
import { ErrorMessage } from "@components/ErrorMessage";
import { PasswordInput } from "@components/PasswordInput";
import type { Blockchain } from "@coral-xyz/common";
import {
  UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE,
  UI_RPC_METHOD_KEYRING_VALIDATE_MNEMONIC,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { useTheme } from "@hooks/useTheme";
import { createStackNavigator } from "@react-navigation/stack";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Pressable, StyleSheet, Text, View } from "react-native";

const Stack = createStackNavigator();

function OnboardingScreen({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: JSX.Element[] | JSX.Element;
}) {
  return (
    <Screen style={{ padding: 24, justifyContent: "space-between" }}>
      <View style={{ marginBottom: 12 }}>
        <Header text={title} />
        {subtitle ? <SubtextParagraph>{subtitle}</SubtextParagraph> : null}
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
  const BLOCKCHAINS = [
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
      {BLOCKCHAINS.map((blockchain) => (
        <Network
          key={blockchain.name}
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
        const route = readOnly ? "CreatePassword" : "ImportAccounts";
        return isValid
          ? navigation.push(route, {
              readOnly,
            })
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

// TODO different flow
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

// TODO KeyboardAvoidingView
function OnboardingCreatePasswordScreen({ route, navigation }) {
  interface CreatePasswordFormData {
    password: string;
    passwordConfirmation: string;
    agreedToTerms: boolean;
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreatePasswordFormData>();

  const onSubmit = ({ password }: CreatePasswordFormData) => {
    navigation.push("Complete", { password, readOnly: route.params.readOnly });
  };

  return (
    <OnboardingScreen
      title="Create a password"
      subtitle="It should be at least 8 characters. You'll need this to unlock Backpack."
    >
      <View style={{ flex: 1, justifyContent: "flex-start" }}>
        <PasswordInput
          placeholder="Password"
          name="password"
          control={control}
          rules={{
            required: "You must specify a password",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
          }}
        />
        <ErrorMessage for={errors.password} />
        <PasswordInput
          placeholder="Confirm Password"
          name="passwordConfirmation"
          control={control}
          rules={{
            validate: (val: string) => {
              if (val !== watch("password")) {
                return "Passwords do not match";
              }
            },
          }}
        />
        <ErrorMessage for={errors.passwordConfirmation} />
      </View>
      <View style={{ marginBottom: 24, justifyContent: "center" }}>
        <CheckBox
          name="agreedToTerms"
          control={control}
          label="I agree to the terms"
        />
        <ErrorMessage for={errors.agreedToTerms} />
      </View>
      <PrimaryButton label="Next" onPress={handleSubmit(onSubmit)} />
    </OnboardingScreen>
  );
}

function OnboardingCompleteScreen({ route, navigation }) {
  const [isValid, setIsValid] = useState(false);
  const background = useBackgroundClient();
  const { params } = route;

  type Params = {
    blockchain: Blockchain;
    accountsAndDerivationPath: string;
    inviteCode: string;
    mnemonic: string;
    password: string;
    username: string;
    usernameAndPubkey: string;
  };

  async function maybeCreateKeyringStore(params: Params): Promise<void> {
    const { accounts, derivationPath } = (() => {
      try {
        return JSON.parse(params.accountsAndDerivationPath!);
      } catch (err) {
        // defaults when creating a wallet
        return { accounts: [0], derivationPath: DerivationPath.Bip44 };
      }
    })();

    const _username = (() => {
      try {
        const { username } = JSON.parse(params.usernameAndPubkey!);
        return username;
      } catch (err) {
        return params.username;
      }
    })();

    try {
      await background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_CREATE,
        params: [
          params.blockchain,
          params.mnemonic,
          derivationPath,
          decodeURIComponent(params.password!),
          accounts,
          _username,
          params.inviteCode,
          undefined, // WaitingRoom.tsx: getWaitlistId(): window.localStorage.getItem(WAITLIST_RES_ID_KEY) ?? undefined,
          Boolean(params.usernameAndPubkey),
        ],
      });
      setIsValid(true);
    } catch (err) {
      console.error("err", err);
      // maybe ALERT!
      // if (
      //   confirm("There was an issue setting up your account. Please try again.")
      // ) {
      //   window.location.reload();
      // }
    }
  }

  return (
    <OnboardingScreen
      title="You've set up Backpack!"
      subtitle="Now get started exploring what your Backpack can do."
    >
      <View>
        <Button title="Browse the xNFT library" />
        <Button title="Follow us on Twitter" />
        <Button title="Join the Discord Community" />
      </View>
      <PrimaryButton
        label="Finish"
        onPress={() => {
          // this should update the keyring store to unlocked to take you to the actual experience
          navigation.navigate("Welcome");
        }}
      />
    </OnboardingScreen>
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
            backgroundColor: theme.custom.colors.background,
          },
          headerTintColor: theme.custom.colors.fontColor,
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

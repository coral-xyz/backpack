// https://github.com/feross/buffer#usage
// note: the trailing slash is important!

import {
  Box,
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
import type {
  Blockchain,
  BlockchainKeyringInit,
  KeyringInit,
} from "@coral-xyz/common";
import {
  DerivationPath,
  KeyringType,
  toTitleCase,
  UI_RPC_METHOD_KEYRING_STORE_CREATE,
  UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE,
  UI_RPC_METHOD_KEYRING_VALIDATE_MNEMONIC,
  UI_RPC_METHOD_PREVIEW_PUBKEYS,
  UI_RPC_METHOD_SIGN_MESSAGE_FOR_WALLET,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { useTheme } from "@hooks/useTheme";
import type { StackScreenProps } from "@react-navigation/stack";
import { createStackNavigator } from "@react-navigation/stack";
import { encode } from "bs58";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { StyleProp, ViewStyle } from "react-native";
import { Button, Pressable, StyleSheet, Text, View } from "react-native";

import {
  OnboardingProvider,
  useOnboardingData,
} from "../lib/OnboardingProvider";

const Buffer = require("buffer/").Buffer;

// TODO(peter) fn: any
function maybeRender(condition: boolean, fn: () => any) {
  if (condition) {
    return fn();
  }
}

type OnboardingStackParamList = {
  CreateOrImportWallet: undefined;
  KeyringTypeSelector: undefined;
  MnemonicInput: undefined;
  SelectBlockchain: undefined;
  ImportAccounts: undefined;
  CreatePassword: undefined;
  Finished: undefined;
};

const Stack = createStackNavigator<OnboardingStackParamList>();

function OnboardingScreen({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: JSX.Element[] | JSX.Element;
}) {
  return (
    <Screen style={{ padding: 24, justifyContent: "space-between" }}>
      <View style={{ marginBottom: 12 }}>
        <Header text={title} />
        {maybeRender(Boolean(subtitle), () => {
          <SubtextParagraph>{subtitle}</SubtextParagraph>;
        })}
      </View>
      {children}
    </Screen>
  );
}

// https://github.com/gorhom/react-native-bottom-sheet
function CreateOrImportWalletScreen({
  navigation,
}: StackScreenProps<OnboardingStackParamList, "CreateOrImportWallet">) {
  const { setOnboardingData } = useOnboardingData();
  return (
    <Screen style={styles.container}>
      <View style={{ alignItems: "center" }}>
        <StyledText style={{ fontSize: 24, marginBottom: 12 }}>
          Backpack
        </StyledText>
        <StyledText>A home for your !! xNFTs</StyledText>
      </View>
      <View
        style={{
          padding: 16,
          alignItems: "center",
        }}
      >
        <PrimaryButton
          label="Create a new wallet"
          onPress={() => {
            setOnboardingData({ action: "create" });
            navigation.push("MnemonicInput");
          }}
        />
        <View style={{ paddingVertical: 8 }}>
          <SubtextParagraph
            onPress={() => {
              setOnboardingData({ action: "import" });
              navigation.push("MnemonicInput");
            }}
          >
            I already have an account
          </SubtextParagraph>
        </View>
      </View>
    </Screen>
  );
}

function OnboardingKeyringTypeSelectorScreen({
  navigation,
}: StackScreenProps<OnboardingStackParamList, "KeyringTypeSelector">) {
  const { onboardingData, setOnboardingData } = useOnboardingData();
  const { action } = onboardingData;

  return (
    <OnboardingScreen title="Keyring Selector">
      {maybeRender(action === "create", () => {
        <>
          <Header text="Create a new wallet" />
          <SubtextParagraph>
            Choose a wallet type. If you're not sure, using a recovery phrase is
            the most common option.
          </SubtextParagraph>
        </>;
      })}
      {maybeRender(action === "import", () => {
        <>
          <Header text="Import an existing wallet" />
          <SubtextParagraph>
            Choose a method to import your wallet.
          </SubtextParagraph>
        </>;
      })}
      {maybeRender(action === "recover", () => {
        <>
          <Header text="Recover a username" />
          <SubtextParagraph>
            Choose a method to recover your username.
          </SubtextParagraph>
        </>;
      })}
      <Box
        style={{
          padding: 16,
          alignItems: "center",
        }}
      >
        <PrimaryButton
          label={`${toTitleCase(action as string)} with recovery phrase`}
          onPress={() => {
            setOnboardingData({ keyringType: "mnemonic" });
            navigation.push("MnemonicInput");
          }}
        />
        <Box style={{ paddingVertical: 8 }}>
          <SubtextParagraph
            onPress={() => {
              setOnboardingData({ keyringType: "ledger" });
              navigation.push("SelectBlockchain");
            }}
          >
            {action === "recover"
              ? "Recover using a hardware wallet"
              : "I have a hardware wallet"}
          </SubtextParagraph>
        </Box>
      </Box>
    </OnboardingScreen>
  );
}

// params.mnemonic (string)
// Create Wallet: readonly = false; Import Wallet: readOnly = true;
function OnboardingMnemonicInputScreen({
  navigation,
}: StackScreenProps<OnboardingStackParamList, "MnemonicInput">) {
  const { onboardingData, setOnboardingData } = useOnboardingData();
  const { action } = onboardingData;
  const readOnly = action === "create";
  console.log({ action, readOnly });

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
        setOnboardingData({ mnemonic });
        return isValid
          ? navigation.push("SelectBlockchain")
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
      {maybeRender(!readOnly, () => (
        <StyledText>
          Use a {mnemonicWords.length === 12 ? "24" : "12"}-word recovery
          mnemonic
        </StyledText>
      ))}
      {maybeRender(readOnly, () => (
        <Button
          title="I saved my secret recovery phrase"
          onPress={() => {
            setChecked(!checked);
          }}
        />
      ))}
      {maybeRender(Boolean(error), () => (
        <ErrorMessage for={{ message: error }} />
      ))}
      <PrimaryButton
        disabled={!nextEnabled}
        label={action === "create" ? "Next" : "Import"}
        onPress={next}
      />
    </OnboardingScreen>
  );
}

// params.blockchain (string)
// TODO(peter) isRecovery flow
function OnboardingBlockchainSelectScreen({
  navigation,
}: StackScreenProps<OnboardingStackParamList, "SelectBlockchain">) {
  const background = useBackgroundClient();
  const { onboardingData, setOnboardingData } = useOnboardingData();
  const {
    mnemonic,
    action,
    inviteCode,
    keyringType,
    blockchainKeyrings,
    blockchainOptions,
  } = onboardingData;

  const selectedBlockchains = blockchainKeyrings.map((b) => b.blockchain);

  const handleBlockchainClick = async (blockchain: Blockchain) => {
    if (selectedBlockchains.includes(blockchain)) {
      // Blockchain is being deselected
      setOnboardingData({
        blockchain: null,
        blockchainKeyrings: blockchainKeyrings.filter(
          (b) => b.blockchain !== blockchain
        ),
      });
    } else {
      // Blockchain is being selected
      if (keyringType === "ledger" || action === "import") {
        // If wallet is a ledger, step through the ledger onboarding flow
        // OR if action is an import then open the drawer with the import accounts
        // component
        setOnboardingData({ blockchain });
        // setOpenDrawer(true);
      } else if (action === "create") {
        // We are creating a new wallet, generate the signature using a default
        // derivation path and account index
        signForWallet(blockchain, DerivationPath.Default, 0);
      }
    }
  };

  const signForWallet = async (
    blockchain: Blockchain,
    derivationPath: DerivationPath,
    accountIndex: number,
    publicKey?: string
  ) => {
    if (!publicKey) {
      // No publicKey given, this is a create action, so preview the public keys
      // and grab the one at the index
      const publicKeys = await background.request({
        method: UI_RPC_METHOD_PREVIEW_PUBKEYS,
        params: [blockchain, mnemonic, derivationPath, accountIndex + 1],
      });

      publicKey = publicKeys[accountIndex];
    }

    const signature = await background.request({
      method: UI_RPC_METHOD_SIGN_MESSAGE_FOR_WALLET,
      params: [
        blockchain,
        // Sign the invite code, or an empty string if no invite code
        // TODO setup a nonce based system
        encode(Buffer.from(inviteCode ? inviteCode : "", "utf-8")),
        derivationPath,
        accountIndex,
        publicKey!,
        mnemonic,
      ],
    });

    addBlockchainKeyring({
      blockchain: blockchain!,
      derivationPath,
      accountIndex,
      publicKey: publicKey!,
      signature,
    });
  };

  // Add the initialisation parameters for a blockchain keyring to state
  const addBlockchainKeyring = (blockchainKeyring: BlockchainKeyringInit) => {
    setOnboardingData({
      blockchainKeyrings: [...blockchainKeyrings, blockchainKeyring],
    });
  };

  function Network({
    name,
    enabled,
    selected,
    onSelect,
  }: {
    name: string;
    enabled: boolean;
    selected: boolean;
    onSelect: (blockchain: Blockchain) => void;
  }) {
    return (
      <View
        style={{
          padding: 8,
          height: 50,
          width: "45%",
          backgroundColor: "#333",
          margin: 4,
        }}
      >
        <Pressable
          onPress={() => {
            if (enabled) {
              // TODO(peter) make sure this is right
              const blockchain = name.toLowerCase() as Blockchain;
              onSelect(blockchain);
            }
          }}
        >
          <Text style={{ color: "#FFF" }}>
            {name} {selected ? "selected" : "not"}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <OnboardingScreen
      title="Which network would you like Backpack to use?"
      subtitle="You can always add additional networks later through the settings menu."
    >
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {blockchainOptions.map((blockchain) => (
          <Network
            key={blockchain.name}
            selected={selectedBlockchains.includes(
              blockchain.name.toLowerCase()
            )}
            enabled={blockchain.enabled}
            name={blockchain.name}
            onSelect={(blockchain: Blockchain) => {
              handleBlockchainClick(blockchain);
            }}
          />
        ))}
      </View>
      <PrimaryButton
        disabled={selectedBlockchains.length === 0}
        label="Next"
        onPress={() => {
          setOnboardingData({ blockchainKeyrings });
          navigation.push("CreatePassword");
        }}
      />
    </OnboardingScreen>
  );
}

// TODO(peter) KeyboardAvoidingView
function OnboardingCreatePasswordScreen({
  navigation,
}: StackScreenProps<OnboardingStackParamList, "CreatePassword">) {
  const { setOnboardingData } = useOnboardingData();
  const isNextDisabled = false; // TODO(peter) disable upon invalid password
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
    setOnboardingData({ password });
    navigation.push("Finished");
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
          label="I agree to the terms of service"
        />
        <ErrorMessage for={errors.agreedToTerms} />
      </View>
      <PrimaryButton
        disabled={isNextDisabled}
        label="Next"
        onPress={handleSubmit(onSubmit)}
      />
    </OnboardingScreen>
  );
}

// TODO(peter) import flow OnboardingAccount/ImportAccounts
function OnboardingImportAccountsScreen({
  navigation,
}: StackScreenProps<OnboardingStackParamList, "ImportAccounts">) {
  // const { onboardingData} = useOnboardingData();
  // const { mnemonic, blockchain } = onboardingData;
  // const allowMultiple = false;

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

function OnboardingFinishedScreen() {
  const { onboardingData } = useOnboardingData();
  const {
    password,
    mnemonic,
    blockchainKeyrings,
    username,
    inviteCode,
    waitlistId,
  } = onboardingData;

  const [isValid, setIsValid] = useState(false);
  const background = useBackgroundClient();

  const keyringInit = {
    mnemonic,
    blockchainKeyrings,
  };

  //
  // Create the user in the backend
  //
  async function createUser() {
    if (inviteCode) {
      const body = JSON.stringify({
        username,
        inviteCode,
        waitlistId, // TODO(peter) waitlistId: getWaitlistId?.(),
        blockchainPublicKeys: keyringInit.blockchainKeyrings.map((b) => ({
          blockchain: b.blockchain,
          publicKey: b.publicKey,
          signature: b.signature,
        })),
      });

      try {
        const res = await fetch("https://auth.xnfts.dev/users", {
          method: "POST",
          body,
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) {
          throw new Error(await res.json());
        }
      } catch (err) {
        throw new Error("error creating account");
      }
    }
  }

  //
  // Create the local store for the wallets
  //
  async function createStore() {
    try {
      await background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_CREATE,
        params: [username, password, keyringInit],
      });
      setIsValid(true);
    } catch (err) {
      console.log("account setup error", err);
      // TODO(peter)
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
        <StyledText>Is Valid: {JSON.stringify(isValid, null, 2)}</StyledText>
      </View>
      <PrimaryButton
        label="Finish"
        onPress={async () => {
          await createUser();
          await createStore();
          // Navigation should happen automagically based on keyring state
        }}
      />
    </OnboardingScreen>
  );
}

// TODO(peter) hardware onboarding, but figure out how first
export default function OnboardingNavigator() {
  const theme = useTheme();
  return (
    <OnboardingProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="CreateOrImportWallet"
          component={CreateOrImportWalletScreen}
        />
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
            name="KeyringTypeSelector"
            component={OnboardingKeyringTypeSelectorScreen}
          />
          <Stack.Screen
            name="MnemonicInput"
            component={OnboardingMnemonicInputScreen}
          />
          <Stack.Screen
            name="SelectBlockchain"
            component={OnboardingBlockchainSelectScreen}
          />
          <Stack.Screen
            name="ImportAccounts"
            component={OnboardingImportAccountsScreen}
          />
          <Stack.Screen
            name="CreatePassword"
            component={OnboardingCreatePasswordScreen}
          />
          <Stack.Screen name="Finished" component={OnboardingFinishedScreen} />
        </Stack.Group>
      </Stack.Navigator>
    </OnboardingProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
    paddingTop: 24,
  },
});

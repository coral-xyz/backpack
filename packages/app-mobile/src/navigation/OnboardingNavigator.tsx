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
import type {
  Blockchain,
  BlockchainKeyringInit,
  KeyringInit,
} from "@coral-xyz/common";
import {
  DerivationPath,
  KeyringType,
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
import { Button, Pressable, StyleSheet, Text, View } from "react-native";

type OnboardingAction = "import" | "create";
type OnboardingStackParamList = {
  Welcome: undefined;
  MnemonicInput: { action: OnboardingAction };
  SelectBlockchain: { action: OnboardingAction; mnemonic: string };
  ImportAccounts: {
    action: OnboardingAction;
    blockchain: Blockchain;
    mnemonic: string;
  };
  CreatePassword: {
    action: OnboardingAction;
    mnemonic: string;
    blockchainKeyrings: BlockchainKeyringInit[];
  };
  Complete: {
    action: OnboardingAction;
    password: string;
    mnemonic: string;
    blockchainKeyrings: BlockchainKeyringInit[];
  };
};

const Stack = createStackNavigator<OnboardingStackParamList>();

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
function WelcomeScreen({
  navigation,
}: StackScreenProps<OnboardingStackParamList, "Welcome">) {
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
          padding: 16,
          alignItems: "center",
        }}
      >
        <PrimaryButton
          label="Create a new wallet"
          onPress={() => {
            navigation.push("MnemonicInput", {
              action: "create",
            });
          }}
        />
        <View style={{ paddingVertical: 8 }}>
          <SubtextParagraph
            onPress={() => {
              navigation.push("MnemonicInput", {
                action: "import",
              });
            }}
          >
            I already have an account
          </SubtextParagraph>
        </View>
      </View>
    </Screen>
  );
}

// params.mnemonic (string)
// Create Wallet: readonly = false; Import Wallet: readOnly = true;
function OnboardingMnemonicInputScreen({
  route,
  navigation,
}: StackScreenProps<OnboardingStackParamList, "MnemonicInput">) {
  const { action } = route.params;
  const readOnly = action === "create";

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
          ? navigation.push("SelectBlockchain", {
              action,
              mnemonic,
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

// params.blockchain (string)
// TODO(peter) multi-select now
function OnboardingBlockchainSelectScreen({
  route,
  navigation,
}: StackScreenProps<OnboardingStackParamList, "SelectBlockchain">) {
  const { mnemonic, action } = route.params;
  const inviteCode = ""; // TODO(peter)
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

  const background = useBackgroundClient();
  const [blockchain, setBlockchain] = useState<Blockchain | null>(null);
  const [blockchainKeyrings, setBlockchainKeyrings] = useState<
    Array<BlockchainKeyringInit>
  >([]);

  const selectedBlockchains = blockchainKeyrings.map((b) => b.blockchain);

  const handleBlockchainClick = async (blockchain: Blockchain) => {
    if (selectedBlockchains.includes(blockchain)) {
      // Blockchain is being deselected
      setBlockchain(null);
      setBlockchainKeyrings(
        blockchainKeyrings.filter((b) => b.blockchain !== blockchain)
      );
    } else {
      // Blockchain is being selected
      // TODO(peter) keyringType === 'ledger'
      if (action === "import") {
        // If wallet is a ledger, step through the ledger onboarding flow
        // OR if action is an import then open the drawer with the import accounts
        // component
        setBlockchain(blockchain);
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
    publicKey?: string // only used for action = 'import'
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

    // TODO(peter) get Buffer working in Expo/React Native

    // const signature = await background.request({
    //   method: UI_RPC_METHOD_SIGN_MESSAGE_FOR_WALLET,
    //   params: [
    //     blockchain,
    //     // Sign the invite code, or an empty string if no invite code
    //     // TODO setup a nonce based system
    //     "",
    //     encode(Buffer.from(inviteCode ? inviteCode : "", "utf-8")),
    //     derivationPath,
    //     accountIndex,
    //     publicKey!,
    //     mnemonic,
    //   ],
    // });
    //
    //
    // @ts-expect-error TODO(peter)
    addBlockchainKeyring({
      blockchain: blockchain!,
      derivationPath,
      accountIndex,
      publicKey: publicKey!,
      // signature,
    });
  };

  // Add the initialisation parameters for a blockchain keyring to state
  const addBlockchainKeyring = (blockchainKeyring: BlockchainKeyringInit) => {
    setBlockchainKeyrings([...blockchainKeyrings, blockchainKeyring]);
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
        {BLOCKCHAINS.map((blockchain) => (
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
          navigation.push("CreatePassword", {
            action,
            mnemonic: route.params.mnemonic,
            blockchainKeyrings,
          });
        }}
      />
    </OnboardingScreen>
  );
}

// TODO(peter) KeyboardAvoidingView
function OnboardingCreatePasswordScreen({
  route,
  navigation,
}: StackScreenProps<OnboardingStackParamList, "CreatePassword">) {
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
    navigation.push("Complete", {
      action: route.params.action,
      password,
      mnemonic: route.params.mnemonic,
      blockchainKeyrings: route.params.blockchainKeyrings,
    });
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

// TODO(peter) import flow
function OnboardingImportAccountsScreen({
  route,
  navigation,
}: StackScreenProps<OnboardingStackParamList, "ImportAccounts">) {
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
            navigation.push("CreatePassword", {
              // TODO (peter) don't spread, make it explicit
              ...route.params,
            });
          }}
        />
      </View>
    </Screen>
  );
}

function OnboardingCompleteScreen({
  route,
  navigation,
}: StackScreenProps<OnboardingStackParamList, "Complete">) {
  const [isValid, setIsValid] = useState(false);
  const background = useBackgroundClient();
  const { password, mnemonic, blockchainKeyrings } = route.params;

  const username = null; // TODO(peter)
  const inviteCode = undefined;
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
        username: null,
        inviteCode,
        undefined, // TODO(peter) waitlistId: getWaitlistId?.(),
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
        label="Finish" // TODO(peter) perhaps a loading indicator if this takes more than a sec so it doesn't look laggy
        onPress={async () => {
          await createUser();
          await createStore();
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

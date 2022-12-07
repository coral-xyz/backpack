// https://github.com/feross/buffer#usage
// note: the trailing slash is important!

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { StyleProp, ViewStyle } from "react-native";
import {
  Alert,
  Button,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  ActionCard,
  BaseCheckBoxLabel,
  Box,
  CheckBox,
  FullScreenLoading,
  Header,
  Margin,
  MnemonicInputFields,
  PasswordInput,
  PrimaryButton,
  Screen,
  StyledText,
  StyledTextInput,
  SubtextParagraph,
  WelcomeLogoHeader,
  Debug,
} from "@components";
import { ErrorMessage } from "@components/ErrorMessage";
import {
  AvalancheIcon,
  BscIcon,
  CheckBadge,
  CosmosIcon,
  DiscordIcon,
  EthereumIcon,
  PolygonIcon,
  SolanaIcon,
  TwitterIcon,
  WidgetIcon,
} from "@components/Icon";
import type {
  Blockchain,
  BlockchainKeyringInit,
  KeyringInit,
} from "@coral-xyz/common";
import {
  BACKEND_API_URL,
  BACKPACK_FEATURE_USERNAMES,
  BACKPACK_FEATURE_XNFT,
  DerivationPath,
  DISCORD_INVITE_LINK,
  KeyringType,
  toTitleCase,
  TWITTER_LINK,
  UI_RPC_METHOD_KEYRING_STORE_CREATE,
  UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE,
  UI_RPC_METHOD_KEYRING_VALIDATE_MNEMONIC,
  UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
  UI_RPC_METHOD_USERNAME_ACCOUNT_CREATE,
  XNFT_GG_LINK,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useTheme } from "@hooks/useTheme";
import type { StackScreenProps } from "@react-navigation/stack";
import { createStackNavigator } from "@react-navigation/stack";
import {
  IconLaunchDetail,
  RoundedContainer,
  SettingsRow,
} from "@screens/Unlocked/Settings/components/SettingsRow";
import { encode } from "bs58";
import * as Linking from "expo-linking";
import { v4 as uuidv4 } from "uuid";

import {
  OnboardingProvider,
  useOnboardingData,
} from "../lib/OnboardingProvider";

// eslint-disable-next-line
const Buffer = require("buffer/").Buffer;

// TODO(peter) fn: any
function maybeRender(condition: boolean, fn: () => any) {
  if (condition) {
    return fn();
  }
}

function getWaitlistId() {
  return undefined;
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
      <Margin bottom={24}>
        <Header text={title} />
        {subtitle ? <SubtextParagraph>{subtitle}</SubtextParagraph> : null}
      </Margin>
      {children}
    </Screen>
  );
}

// https://github.com/gorhom/react-native-bottom-sheet
function OnboardingCreateOrImportWalletScreen({
  navigation,
}: StackScreenProps<OnboardingStackParamList, "CreateOrImportWallet">) {
  const theme = useTheme();
  const { setOnboardingData } = useOnboardingData();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // variables
  const snapPoints = useMemo(() => [200], []);

  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const menuOptions = [
    {
      icon: (
        <MaterialIcons
          color={theme.custom.colors.secondary}
          size={24}
          name="lock"
        />
      ),
      label: "Backpack.app",
      onPress: () => Linking.openURL(BACKPACK_LINK),
      detailIcon: <IconLaunchDetail />,
    },
    {
      icon: <TwitterIcon color={theme.custom.colors.secondary} />,
      label: "Twitter",
      onPress: () => Linking.openURL(TWITTER_LINK),
      detailIcon: <IconLaunchDetail />,
    },
    {
      icon: <DiscordIcon color={theme.custom.colors.secondary} />,
      label: "Need help? Hop into Discord",
      onPress: () => Linking.openURL(DISCORD_INVITE_LINK),
      detailIcon: <IconLaunchDetail />,
    },
  ];

  return (
    <>
      <Screen style={styles.container}>
        <Pressable
          onPress={() => {
            handlePresentModalPress();
          }}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            zIndex: 999,
          }}
        >
          <MaterialIcons
            name="menu"
            size={32}
            color={theme.custom.colors.fontColor}
          />
        </Pressable>

        <Margin top={48} bottom={24}>
          <WelcomeLogoHeader />
        </Margin>
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
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={{
          marginTop: 12,
          backgroundColor: theme.custom.colors.background,
        }}
      >
        <RoundedContainer>
          <FlatList
            data={menuOptions}
            scrollEnabled={false}
            renderItem={({ item }) => {
              return (
                <SettingsRow
                  onPress={item.onPress}
                  icon={item.icon}
                  detailIcon={item.detailIcon}
                  label={item.label}
                />
              );
            }}
          />
        </RoundedContainer>
      </BottomSheetModal>
    </>
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
        <Margin bottom={12}>
          <BaseCheckBoxLabel
            label="I saved my secret recovery phrase"
            value={checked}
            onPress={() => {
              setChecked(!checked);
            }}
          />
        </Margin>
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
      method: UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
      params: [
        blockchain,
        // Sign the invite code, or an empty string if no invite code
        // TODO setup a nonce based system
        encode(Buffer.from(inviteCode ? inviteCode : "", "utf-8")),
        publicKey!,
        {
          derivationPath,
          accountIndex,
          mnemonic,
        },
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
    id,
    label,
    enabled,
    selected,
    onSelect,
  }: {
    id: Blockchain;
    label: string;
    enabled: boolean;
    selected: boolean;
    onSelect: (b: Blockchain) => void;
  }) {
    function getIcon(id) {
      switch (id) {
        case "ethereum":
          return <EthereumIcon width={24} height={24} />;
        case "solana":
          return <SolanaIcon width={24} height={24} />;
        case "polygon":
          return <PolygonIcon width={24} height={24} />;
        case "bsc":
          return <BscIcon width={24} height={24} />;
        case "cosmos":
          return <CosmosIcon width={24} height={24} />;
        case "valanache":
          return <AvalancheIcon width={24} height={24} />;
        default:
          return null;
      }
    }

    return (
      <View style={{ flex: 1, margin: 6 }}>
        <ActionCard
          text={label}
          disabled={!enabled}
          icon={getIcon(id)}
          textAdornment={selected ? <CheckBadge /> : ""}
          onPress={() => {
            if (enabled) {
              onSelect(id);
            }
          }}
        />
      </View>
    );
  }

  function renderItem({ item }) {
    return (
      <Network
        id={item.id}
        selected={selectedBlockchains.includes(item.id)}
        enabled={item.enabled}
        label={item.label}
        onSelect={(b: Blockchain) => handleBlockchainClick(b)}
      />
    );
  }

  return (
    <OnboardingScreen
      title="Which network would you like Backpack to use?"
      subtitle="You can always add additional networks later through the settings menu."
    >
      <FlatList
        numColumns={2}
        data={blockchainOptions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        extraData={selectedBlockchains}
        scrollEnabled={false}
        initialNumToRender={blockchainOptions.length}
      />
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

type CreatePasswordFormData = {
  password: string;
  passwordConfirmation: string;
  agreedToTerms: boolean;
};

// TODO(peter) KeyboardAvoidingView
function OnboardingCreatePasswordScreen({
  navigation,
}: StackScreenProps<OnboardingStackParamList, "CreatePassword">) {
  const { setOnboardingData } = useOnboardingData();

  const { control, handleSubmit, formState, watch } =
    useForm<CreatePasswordFormData>();
  const { errors, isValid } = formState;

  const onSubmit = ({ password }: CreatePasswordFormData) => {
    Alert.alert("password", JSON.stringify({ isValid, password }));
    setOnboardingData({ password, complete: true });
    navigation.push("Finished");
  };

  // TODO(peter) some fk'd up shit is happening here where the hook claims to be invalid when it's not
  return (
    <OnboardingScreen
      title="Create a password"
      subtitle="It should be at least 8 characters. You'll need this to unlock Backpack."
    >
      <View style={{ flex: 1, justifyContent: "flex-start" }}>
        <Debug data={{ isValid, formState }} />
        <Margin bottom={12}>
          <PasswordInput
            name="password"
            placeholder="Password"
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
        </Margin>
        <PasswordInput
          name="passwordConfirmation"
          placeholder="Confirm Password"
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
      <View style={{ marginBottom: 24 }}>
        <CheckBox
          name="agreedToTerms"
          control={control}
          label="I agree to the terms of service"
        />
        <ErrorMessage for={errors.agreedToTerms} />
      </View>
      <PrimaryButton
        // disabled={!isValid}
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
  const background = useBackgroundClient();
  const { onboardingData } = useOnboardingData();
  let {
    password,
    mnemonic,
    blockchainKeyrings,
    username,
    inviteCode,
    waitlistId,
    isAddingAccount,
    userId,
  } = onboardingData;

  const [isValid, setIsValid] = useState(false);

  const keyringInit = {
    mnemonic,
    blockchainKeyrings,
  };

  useEffect(() => {
    (async () => {
      const { id } = await createUser();
      createStore(id);
    })();
  }, []);

  //
  // Create the user in the backend
  //
  async function createUser(): Promise<{ id: string }> {
    // If userId is provided, then we are onboarding via the recover flow.
    if (userId) {
      return { id: userId };
    }
    // If userId is not provided and an invite code is not provided, then
    // this is dev mode.
    if (!inviteCode) {
      return { id: uuidv4() };
    }

    //
    // If we're down here, then we are creating a user for the first time.
    //
    const body = JSON.stringify({
      username,
      inviteCode,
      waitlistId: getWaitlistId?.(),
      blockchainPublicKeys: keyringInit.blockchainKeyrings.map((b) => ({
        blockchain: b.blockchain,
        publicKey: b.publicKey,
        signature: b.signature,
      })),
    });

    try {
      const res = await fetch(`${BACKEND_API_URL}/users`, {
        method: "POST",
        body,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(await res.json());
      }
      return await res.json();
    } catch (err) {
      throw new Error("error creating account");
    }
  }

  //
  // Create the local store for the wallets
  //
  async function createStore(uuid: string) {
    try {
      //
      // If usernames are disabled, use a default one for developing.
      //
      if (!BACKPACK_FEATURE_USERNAMES) {
        username = uuidv4().split("-")[0];
      }

      if (isAddingAccount) {
        await background.request({
          method: UI_RPC_METHOD_USERNAME_ACCOUNT_CREATE,
          params: [username, keyringInit, uuid],
        });
      } else {
        await background.request({
          method: UI_RPC_METHOD_KEYRING_STORE_CREATE,
          params: [username, password, keyringInit, uuid],
        });
      }

      setIsValid(true);
    } catch (err) {
      console.log("account setup error", err);
      // if (
      //   confirm("There was an issue setting up your account. Please try again.")
      // ) {
      //   // window.location.reload();
      // }
    }
  }

  function Cell({ children, style }: any): JSX.Element {
    return (
      <View style={[{ alignSelf: "flex-start", marginBottom: 12 }, style]}>
        {" "}
        {children}{" "}
      </View>
    );
  }

  return !isValid ? (
    <FullScreenLoading />
  ) : (
    <OnboardingScreen
      title="You've set up Backpack!"
      subtitle="Now get started exploring what your Backpack can do."
    >
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {BACKPACK_FEATURE_XNFT && (
          <Cell style={{ paddingRight: 6 }}>
            <ActionCard
              icon={<WidgetIcon />}
              text="Browse the xNFT library"
              onClick={() => Linking.openURL(XNFT_GG_LINK)}
            />
          </Cell>
        )}
        <Cell style={{ paddingLeft: 6 }}>
          <ActionCard
            icon={<TwitterIcon />}
            text="Follow us on Twitter"
            onClick={() => Linking.openURL(TWITTER_LINK)}
          />
        </Cell>
        <Cell>
          <ActionCard
            icon={<DiscordIcon />}
            text="Join the Discord community"
            onClick={() => Linking.openURL(DISCORD_INVITE_LINK)}
          />
        </Cell>
      </View>
      <PrimaryButton
        label="Finish"
        onPress={async () => {
          // await createUser();
          // await createStore();
          // Navigation should happen automagically based on keyring state
        }}
      />
    </OnboardingScreen>
  );
}

export default function OnboardingNavigator(): JSX.Element {
  const theme = useTheme();
  return (
    <OnboardingProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="CreateOrImportWallet"
          component={OnboardingCreateOrImportWalletScreen}
        />
        <Stack.Group
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.custom.colors.background,
              shadowColor: "transparent",
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

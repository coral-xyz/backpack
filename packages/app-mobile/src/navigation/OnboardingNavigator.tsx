import type {
  Blockchain,
  ServerPublicKey,
  WalletDescriptor,
} from "@coral-xyz/common";
import type { StackScreenProps } from "@react-navigation/stack";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  Platform,
  KeyboardAvoidingView,
  Pressable,
  Text,
  DevSettings,
  StyleProp,
  ViewStyle,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";

import {
  getAuthMessage,
  formatWalletAddress,
  getRecoveryPaths,
  UI_RPC_METHOD_PREVIEW_PUBKEYS,
  BACKEND_API_URL,
  DISCORD_INVITE_LINK,
  toTitleCase,
  TWITTER_LINK,
  UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE,
  UI_RPC_METHOD_KEYRING_VALIDATE_MNEMONIC,
  XNFT_GG_LINK,
  PrivateKeyWalletDescriptor,
} from "@coral-xyz/common";
import {
  useSavePrivateKey,
  useBackgroundClient,
  OnboardingProvider,
  useOnboarding,
  useRpcRequests,
} from "@coral-xyz/recoil";
import { Stack as Box, YStack, TextArea } from "@coral-xyz/tamagui";
import { MaterialIcons } from "@expo/vector-icons";
import { createStackNavigator } from "@react-navigation/stack";
import { useForm } from "react-hook-form";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BottomSheetHelpModal,
  HelpModalMenuButton,
} from "~components/BottomSheetHelpModal";
import {
  BaseCheckBoxLabel,
  ControlledCheckBoxLabel,
} from "~components/CheckBox";
import { ErrorMessage } from "~components/ErrorMessage";
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
} from "~components/Icon";
import { UsernameInput } from "~components/StyledTextInput";
import {
  ActionCard,
  FullScreenLoading,
  Header,
  Margin,
  MnemonicInputFields,
  PasswordInput,
  PrimaryButton,
  SecondaryButton,
  LinkButton,
  Screen,
  StyledText,
  SubtextParagraph,
  WelcomeLogoHeader,
  CopyButton,
  PasteButton,
  EmptyState,
  CallToAction,
} from "~components/index";
import { useTheme } from "~hooks/useTheme";
import { useSession } from "~lib/SessionProvider";
import { maybeRender } from "~lib/index";

import {
  BiometricAuthenticationStatus,
  BIOMETRIC_PASSWORD,
  tryLocalAuthenticate,
} from "~src/features/biometrics";
import {
  biometricAuthenticationSuccessful,
  useDeviceSupportsBiometricAuth,
} from "~src/features/biometrics/hooks";
import * as Linking from "~src/lib/linking";

const logger =
  (prefix = "") =>
  (...args: any) => {
    if (process.env.NODE_ENV === "development") {
      console.log(prefix, ...args);
    }
  };

const maybeLog = logger("on1");

async function fetchRequestCheckIfUserExists({
  username,
}: {
  username: string;
}): Promise<{ id: string; publicKeys: ServerPublicKey[]; msg?: string }> {
  const res = await fetch(`${BACKEND_API_URL}/users/${username}`);
  const json = await res.json();

  if (!res.ok) {
    const errorMessage = json.msg || "fetching username failed";
    throw new Error(errorMessage);
  }

  return json;
}

async function fetchRequestCreateUser({
  username,
  inviteCode,
}: {
  username: string;
  inviteCode: string | undefined;
}) {
  const res = await fetch(`https://auth.xnfts.dev/users/${username}`, {
    headers: {
      "x-backpack-invite-code": inviteCode || "",
    },
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "creating user failed");
  }

  return json;
}

function Network({
  id,
  label,
  enabled,
  selected,
  loading,
  onSelect,
}: {
  id: Blockchain;
  label: string;
  enabled: boolean;
  selected: boolean;
  loading: boolean;
  onSelect: (b: Blockchain) => void;
}) {
  function getIcon(id: string): JSX.Element | null {
    switch (id) {
      case "ethereum":
        return <EthereumIcon width={32} height={32} />;
      case "solana":
        return <SolanaIcon width={32} height={32} />;
      case "polygon":
        return <PolygonIcon width={32} height={32} />;
      case "bsc":
        return <BscIcon width={32} height={32} />;
      case "cosmos":
        return <CosmosIcon width={32} height={32} />;
      case "avalanche":
        return <AvalancheIcon width={32} height={32} />;
      default:
        return null;
    }
  }

  const getAdornment = (loading: boolean, selected: boolean) => {
    if (loading) {
      return <ActivityIndicator size="small" />;
    }

    if (selected) {
      return <CheckBadge />;
    }

    return null;
  };

  return (
    <View style={{ flex: 1 }}>
      <ActionCard
        text={label}
        disabled={!enabled}
        icon={getIcon(id)}
        textAdornment={getAdornment(loading, selected)}
        onPress={() => {
          if (enabled) {
            onSelect(id);
          }
        }}
      />
    </View>
  );
}

type OnboardingStackParamList = {
  CreateOrRecoverAccount: undefined;
  CreateOrRecoverUsername: undefined;
  CreateOrImportWallet: undefined;
  KeyringTypeSelector: undefined;
  PrivateKeyInput: undefined;
  MnemonicInput: undefined;
  MnemonicSearch: undefined;
  SelectBlockchain: undefined;
  CreatePassword: undefined;
  Biometrics: undefined;
  CreateAccountLoading: undefined;
};

type Route = {
  [key: string]: keyof OnboardingStackParamList;
};

// in order
const Routes: Route = {
  CreateOrRecoverAccount: "CreateOrRecoverAccount",
  CreateOrRecoverUsername: "CreateOrRecoverUsername",
  MnemonicInput: "MnemonicInput",
  Biometrics: "Biometrics",
  CreatePassword: "CreatePassword",
  CreateAccountLoading: "CreateAccountLoading",
};

const RecoverAccountRoutes: Route = {
  CreateOrRecoverUsername: "CreateOrRecoverUsername",
  KeyringTypeSelector: "KeyringTypeSelector",
  PrivateKeyInput: "PrivateKeyInput",
};

const NewAccountRoutes: Route = {
  CreateOrImportWallet: "CreateOrImportWallet",
  CreateOrRecoverUsername: "CreateOrRecoverUsername",
  KeyringTypeSelector: "KeyringTypeSelector",
};

const Stack = createStackNavigator<OnboardingStackParamList>();

function OnboardingScreen({
  title,
  subtitle,
  children,
  style,
  scrollable,
}: {
  title?: string;
  subtitle?: string;
  children?: any;
  style?: StyleProp<ViewStyle>;
  scrollable?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Screen
      scrollable={scrollable}
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom + 16,
        },
        style,
      ]}
    >
      {title || subtitle ? (
        <Box mb={24}>
          {title ? <Header text={title} /> : null}
          {subtitle ? <SubtextParagraph>{subtitle}</SubtextParagraph> : null}
        </Box>
      ) : null}
      {children}
    </Screen>
  );
}

type CreateOrRecoverAccountScreenProps = StackScreenProps<
  OnboardingStackParamList,
  "CreateOrRecoverAccount"
>;

function CreateOrRecoverAccountScreen({
  navigation,
}: CreateOrRecoverAccountScreenProps) {
  const insets = useSafeAreaInsets();
  const { setOnboardingData } = useOnboarding();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handlePresentModalPress = () => {
    setIsModalVisible((last) => !last);
  };

  return (
    <>
      <Screen
        style={[
          styles.container,
          {
            marginTop: insets.top,
            // marginBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
        ]}
      >
        <HelpModalMenuButton onPress={handlePresentModalPress} />
        <Box marginTop={48} marginBottom={24}>
          <WelcomeLogoHeader />
        </Box>
        <Box padding={16} alignItems="center">
          <PrimaryButton
            label="Create a new account"
            onPress={() => {
              setOnboardingData({
                action: "create",
                inviteCode: "8b9f708f-df0a-497a-8bc1-f1df42959a84", // dev inviteCode
              });
              navigation.push(NewAccountRoutes.CreateOrRecoverUsername);
            }}
          />
          <LinkButton
            label="I already have an account"
            onPress={() => {
              setOnboardingData({ action: "recover" });
              navigation.push(RecoverAccountRoutes.CreateOrRecoverUsername);
            }}
          />
        </Box>
      </Screen>
      <BottomSheetHelpModal
        isVisible={isModalVisible}
        resetVisibility={() => {
          setIsModalVisible(() => false);
        }}
      />
    </>
  );
}

type OnboardingCreateOrImportWalletScreenProps = StackScreenProps<
  OnboardingStackParamList,
  "CreateOrImportWallet"
>;

function OnboardingCreateOrImportWalletScreen({
  navigation,
}: OnboardingCreateOrImportWalletScreenProps) {
  const { setOnboardingData } = useOnboarding();

  return (
    <OnboardingScreen>
      <Box mb={24}>
        <WelcomeLogoHeader />
      </Box>
      <Box>
        <PrimaryButton
          label="Create a new wallet"
          onPress={() => {
            setOnboardingData({ action: "create" });
            navigation.push(NewAccountRoutes.KeyringTypeSelector);
          }}
        />
        <LinkButton
          label="I already have an wallet"
          onPress={() => {
            setOnboardingData({ action: "recover" });
            navigation.push(RecoverAccountRoutes.KeyringTypeSelector);
          }}
        />
      </Box>
    </OnboardingScreen>
  );
}

type OnboardingKeyringTypeSelectorScreenProps = StackScreenProps<
  OnboardingStackParamList,
  "KeyringTypeSelector"
>;

function OnboardingKeyringTypeSelectorScreen({
  navigation,
}: OnboardingKeyringTypeSelectorScreenProps) {
  const { onboardingData, setOnboardingData } = useOnboarding();
  const { action } = onboardingData;
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  return (
    <OnboardingScreen>
      {maybeRender(action === "create", () => (
        <View style={{ alignSelf: "center" }}>
          <Header text="Create a new wallet" style={{ textAlign: "center" }} />
          <SubtextParagraph style={{ textAlign: "center" }}>
            Choose a wallet type. If you're not sure, using a recovery phrase is
            the most common option.
          </SubtextParagraph>
        </View>
      ))}
      {maybeRender(action === "import", () => (
        <View style={{ alignSelf: "center" }}>
          <Header
            text="Import an existing wallet"
            style={{ textAlign: "center" }}
          />
          <SubtextParagraph style={{ textAlign: "center" }}>
            Choose a method to import your wallet.
          </SubtextParagraph>
        </View>
      ))}
      {maybeRender(action === "recover", () => (
        <View style={{ alignSelf: "center" }}>
          <Header text="Recover a username" style={{ textAlign: "center" }} />
          <SubtextParagraph style={{ textAlign: "center" }}>
            Choose a method to recover your username.
          </SubtextParagraph>
        </View>
      ))}
      <Box padding={16} alignItems="center">
        <PrimaryButton
          label={`${toTitleCase(action as string)} with secret phrase`}
          onPress={() => {
            setOnboardingData({ keyringType: "mnemonic" });
            navigation.push(Routes.MnemonicInput);
          }}
        />
        {showAdvancedOptions ? (
          <YStack mt={16} space={16} width="100%">
            <SecondaryButton
              label="Recover with private key"
              onPress={() => {
                setOnboardingData({ keyringType: "private-key" });
                navigation.push(RecoverAccountRoutes.PrivateKeyInput);
              }}
            />
          </YStack>
        ) : null}
        <LinkButton
          label={
            showAdvancedOptions
              ? "Hide advanced options"
              : "Show advanced options"
          }
          onPress={() => {
            setShowAdvancedOptions(!showAdvancedOptions);
          }}
        />
      </Box>
    </OnboardingScreen>
  );
}

type OnboardingPrivateKeyInputScreenProps = StackScreenProps<
  OnboardingStackParamList,
  "PrivateKeyInput"
>;

function OnboardingPrivateKeyInputScreen({
  navigation,
}: OnboardingPrivateKeyInputScreenProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [privateKey, setPrivateKey] = useState("");
  const { handlePrivateKeyInput, onboardingData } = useOnboarding();
  const { serverPublicKeys } = onboardingData;
  const { appState } = useSession();

  const { handleSavePrivateKey } = useSavePrivateKey({
    onboarding: true,
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={64}
    >
      <OnboardingScreen>
        <Box>
          <Header text="Enter private key" style={{ textAlign: "center" }} />
          <SubtextParagraph style={{ textAlign: "center" }}>
            Enter your private key. It will be encrypted and stored on your
            device.
          </SubtextParagraph>
        </Box>
        <Box>
          <TextArea
            autoFocus
            mb={12}
            bg="$nav"
            height={100}
            value={privateKey}
            placeholder="Enter private key"
            onChangeText={setPrivateKey}
          />
          {error ? <StyledText color="red">{error}</StyledText> : null}
          <PrimaryButton
            loading={loading}
            disabled={loading || privateKey.length === 0}
            label="Import"
            onPress={async () => {
              const result = await handleSavePrivateKey({
                name: "",
                privateKey: privateKey.trim(),
                serverPublicKeys,
                setLoading,
                setError,
              });

              await handlePrivateKeyInput(result as PrivateKeyWalletDescriptor);
              if (appState === "isAddingAccount") {
                navigation.push(Routes.CreateAccountLoading);
              } else {
                navigation.push(Routes.Biometrics);
              }
            }}
          />
        </Box>
      </OnboardingScreen>
    </KeyboardAvoidingView>
  );
}

function CreateOrRecoverUsernameScreen({
  navigation,
}: StackScreenProps<
  OnboardingStackParamList,
  "CreateOrRecoverUsername"
>): JSX.Element {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const { onboardingData, setOnboardingData } = useOnboarding();
  const { action } = onboardingData; // create | recover

  const screenTitle =
    action === "create" ? "Claim your username" : "Username recovery";

  const text =
    action === "create" ? (
      <View style={{ flex: 1 }}>
        <Box marginBottom={12}>
          <SubtextParagraph>
            Others can see and find you by this username, and it will be
            associated with your primary wallet address.
          </SubtextParagraph>
        </Box>
        <Box marginBottom={12}>
          <SubtextParagraph>
            Choose wisely if you'd like to remain anonymous.
          </SubtextParagraph>
        </Box>
        <SubtextParagraph>Have fun!</SubtextParagraph>
      </View>
    ) : (
      <View style={{ flex: 1 }}>
        <SubtextParagraph>
          Enter your username below, you will then be asked for your secret
          recovery phrase to verify that you own the public key that was
          initially associated with it.
        </SubtextParagraph>
      </View>
    );

  const handlePresContinue = async () => {
    setLoading(true);
    if (action === "recover") {
      try {
        const json = await fetchRequestCheckIfUserExists({ username });
        setOnboardingData({
          username,
          userId: json.id,
          serverPublicKeys: json.publicKeys,
        });

        navigation.push(RecoverAccountRoutes.KeyringTypeSelector);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (action === "create") {
      try {
        await fetchRequestCreateUser({
          username,
          inviteCode: onboardingData.inviteCode,
        });

        setOnboardingData({ username });
        navigation.push(NewAccountRoutes.CreateOrImportWallet);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={78}
    >
      <OnboardingScreen title={screenTitle}>
        {text}
        <View>
          <Box marginBottom={18}>
            <UsernameInput
              username={username}
              onChange={setUsername}
              onComplete={handlePresContinue}
            />
          </Box>
          {maybeRender(error !== "", () => (
            <ErrorMessage for={{ message: error }} />
          ))}
          <PrimaryButton
            loading={loading}
            disabled={!username?.length}
            label="Continue"
            onPress={handlePresContinue}
          />
        </View>
      </OnboardingScreen>
    </KeyboardAvoidingView>
  );
}

function OnboardingMnemonicInputScreen({
  navigation,
}: StackScreenProps<OnboardingStackParamList, "MnemonicInput">) {
  const { onboardingData, setOnboardingData } = useOnboarding();
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
  // Generate a random mnemonic and populate state.
  //
  const generateRandom = useCallback(() => {
    background
      .request({
        method: UI_RPC_METHOD_KEYRING_STORE_MNEMONIC_CREATE,
        params: [mnemonicWords.length === 12 ? 128 : 256],
      })
      .then((m: string) => {
        const words = m.split(" ");
        setMnemonicWords(words);
      });
  }, []); // eslint-disable-line

  const next = () => {
    background
      .request({
        method: UI_RPC_METHOD_KEYRING_VALIDATE_MNEMONIC,
        params: [mnemonic],
      })
      .then((isValid: boolean) => {
        setOnboardingData({ mnemonic });
        const route =
          action === "recover" ? "MnemonicSearch" : "SelectBlockchain";
        return isValid
          ? navigation.push(route)
          : setError("Invalid secret recovery phrase");
      });
  };

  useEffect(() => {
    if (readOnly) {
      generateRandom();
    }
  }, [readOnly, generateRandom]);

  return (
    <OnboardingScreen
      scrollable
      title="Secret recovery phrase"
      subtitle={subtitle}
    >
      <View>
        <MnemonicInputFields
          mnemonicWords={mnemonicWords}
          onChange={readOnly ? undefined : setMnemonicWords}
          onComplete={next}
        />
        <Margin top={12}>
          {readOnly ? (
            <CopyButton text={mnemonicWords.join(", ")} />
          ) : (
            <PasteButton
              onPaste={(words) => {
                const split = words.split(" ");
                if ([12, 24].includes(split.length)) {
                  setMnemonicWords(words.split(" "));
                } else {
                  Alert.alert("Mnemonic should be either 12 or 24 words");
                }
              }}
            />
          )}
        </Margin>
      </View>
      <View style={{ flex: 1 }} />
      <View>
        {maybeRender(!readOnly, () => (
          <Pressable
            style={{ alignSelf: "center", marginBottom: 18 }}
            onPress={() => {
              setMnemonicWords([
                ...Array(mnemonicWords.length === 12 ? 24 : 12).fill(""),
              ]);
            }}
          >
            <Text style={{ fontSize: 18 }}>
              Use a {mnemonicWords.length === 12 ? "24" : "12"}-word recovery
              mnemonic
            </Text>
          </Pressable>
        ))}
        {maybeRender(readOnly, () => (
          <View style={{ alignSelf: "center" }}>
            <Margin bottom={18}>
              <BaseCheckBoxLabel
                label="I saved my secret recovery phrase"
                value={checked}
                onPress={() => {
                  setChecked(!checked);
                }}
              />
            </Margin>
          </View>
        ))}
        {maybeRender(Boolean(error), () => (
          <ErrorMessage for={{ message: error }} />
        ))}
        <PrimaryButton
          disabled={!nextEnabled}
          label={action === "create" ? "Next" : "Import"}
          onPress={next}
        />
        <LinkButton
          label="Start over"
          onPress={() => {
            setMnemonicWords([...Array(12).fill("")]);
          }}
        />
      </View>
    </OnboardingScreen>
  );
}

function MnemonicSearchScreen({
  navigation,
}: StackScreenProps<OnboardingStackParamList, "MnemonicSearch">): JSX.Element {
  const background = useBackgroundClient();
  const { onboardingData, setOnboardingData } = useOnboarding();
  const { signMessageForWallet } = useRpcRequests();
  const { appState } = useSession();

  const { userId } = onboardingData;
  const authMessage = userId ? getAuthMessage(userId) : "";
  const { serverPublicKeys, mnemonic } = onboardingData;

  const [error, setError] = useState(false);

  // TODO(peter) make this apart of the MnemomicInput step and render this as a component if it doesn't work
  useEffect(() => {
    (async () => {
      const walletDescriptors: WalletDescriptor[] = [];

      const blockchains = [
        ...new Set(serverPublicKeys.map((x) => x.blockchain)),
      ];

      for (const blockchain of blockchains) {
        const recoveryPaths = getRecoveryPaths(blockchain);
        const publicKeys = await background.request({
          method: UI_RPC_METHOD_PREVIEW_PUBKEYS,
          params: [blockchain, mnemonic, recoveryPaths],
        });

        const searchPublicKeys = serverPublicKeys
          .filter((b) => b.blockchain === blockchain)
          .map((p) => p.publicKey);

        for (const publicKey of searchPublicKeys) {
          const index = publicKeys.findIndex((p: string) => p === publicKey);
          if (index !== -1) {
            walletDescriptors.push({
              blockchain,
              derivationPath: recoveryPaths[index],
              publicKey,
            });
          }
        }
      }

      if (walletDescriptors.length > 0) {
        const signedWalletDescriptors = await Promise.all(
          walletDescriptors.map(async (w) => ({
            ...w,
            signature: await signMessageForWallet(
              w.blockchain,
              w.publicKey,
              authMessage,
              {
                mnemonic,
                signedWalletDescriptors: [{ ...w, signature: "" }],
              }
            ),
          }))
        );

        setOnboardingData({ signedWalletDescriptors });

        if (appState === "isAddingAccount") {
          navigation.push(Routes.CreateAccountLoading);
        } else {
          navigation.push(Routes.Biometrics);
        }
      } else {
        setError(true);
      }
    })();
  }, []); // eslint-disable-line

  if (!error) {
    return <FullScreenLoading />;
  }

  const subtitle =
    serverPublicKeys.length === 1
      ? `We couldn't find the public key
            ${formatWalletAddress(serverPublicKeys[0].publicKey)} using your
            recovery phrase.`
      : `We couldn't find any wallets using your recovery phrase.`;

  return (
    <OnboardingScreen title="Unable to recover wallet" subtitle={subtitle}>
      <Box />
      <PrimaryButton
        label="Go back & retry"
        onPress={() => navigation.goBack()}
      />
    </OnboardingScreen>
  );
}

function OnboardingBlockchainSelectScreen({
  navigation,
}: StackScreenProps<OnboardingStackParamList, "SelectBlockchain">) {
  const [status, setStatus] = useState([]); // eslint-disable-line
  const [loading, setLoading] = useState(new Set());
  const { onboardingData, handleSelectBlockchain } = useOnboarding();
  const { blockchainOptions, selectedBlockchains } = onboardingData;
  const { appState } = useSession();
  const numColumns = 2;
  const gap = 8;

  return (
    <OnboardingScreen
      title="Which network would you like Backpack to use?"
      subtitle="You can always add additional networks later through the settings menu."
    >
      <FlatList
        numColumns={numColumns}
        data={blockchainOptions}
        keyExtractor={(item) => item.id}
        extraData={selectedBlockchains}
        scrollEnabled={false}
        initialNumToRender={blockchainOptions.length}
        contentContainerStyle={{ gap }}
        columnWrapperStyle={{ gap }}
        renderItem={({ item }) => {
          return (
            <Network
              id={item.id as Blockchain}
              selected={selectedBlockchains.includes(item.id as Blockchain)}
              loading={loading.has(item.id)}
              enabled={item.enabled}
              label={item.label}
              onSelect={async (blockchain) => {
                setStatus([]);
                setLoading((prev) => new Set(prev.add(blockchain)));
                await handleSelectBlockchain({
                  blockchain,
                  onStatus: (status) => {
                    // @ts-ignore
                    setStatus((prev) => [
                      ...prev,
                      { b: blockchain, s: status },
                    ]);
                  },
                });

                setLoading(
                  (prev) => new Set([...prev].filter((x) => x !== blockchain))
                );
              }}
            />
          );
        }}
      />
      <PrimaryButton
        disabled={selectedBlockchains.length === 0}
        label="Next"
        onPress={() => {
          if (appState === "isAddingAccount") {
            navigation.push(Routes.CreateAccountLoading);
          } else {
            navigation.push(Routes.Biometrics);
          }
        }}
      />
    </OnboardingScreen>
  );
}

type BiometricsScreenProps = StackScreenProps<
  OnboardingStackParamList,
  "Biometrics"
>;

export function OnboardingBiometricsScreen({
  navigation,
  route,
}: BiometricsScreenProps): JSX.Element {
  const insets = useSafeAreaInsets();
  const { setOnboardingData } = useOnboarding();
  const { biometricName } = useDeviceSupportsBiometricAuth();

  const onPressNext = useCallback(() => {
    navigation.navigate({
      name: "CreateAccountLoading",
      params: route.params,
      merge: true,
    });
  }, [navigation, route.params]);

  const onPressEnableBiometrics = useCallback(async () => {
    const authStatus = await tryLocalAuthenticate({
      disableDeviceFallback: true,
    });

    if (
      authStatus === BiometricAuthenticationStatus.Unsupported ||
      authStatus === BiometricAuthenticationStatus.MissingEnrollment
    ) {
      Alert.alert(
        `${biometricName} is disabled`,
        `To enable ${biometricName}, allow access in system settings`,
        [
          {
            text: "Settings",
            onPress: Linking.openSettings,
          },
          {
            text: "Not now",
            onPress: () => {
              navigation.push(Routes.CreatePassword);
            },
          },
        ]
      );
    }

    if (biometricAuthenticationSuccessful(authStatus)) {
      setOnboardingData({ password: BIOMETRIC_PASSWORD });
      onPressNext();
    }
  }, [onPressNext, navigation, setOnboardingData, biometricName]);

  return (
    <OnboardingScreen
      title={`Enable ${biometricName}`}
      subtitle={`${biometricName} can be used to unlock your device`}
      style={{
        paddingTop: insets.top + 36,
        paddingBottom: insets.bottom + 24,
      }}
    >
      <Box space={8}>
        <LinkButton
          disabled={false}
          label="Maybe later"
          onPress={() => {
            Alert.alert(`You can always turn ${biometricName} on in Settings`);
            navigation.push(Routes.CreatePassword);
          }}
        />
        <PrimaryButton
          disabled={false}
          label="Turn on Face ID"
          onPress={onPressEnableBiometrics}
        />
      </Box>
    </OnboardingScreen>
  );
}

type CreatePasswordFormData = {
  password: string;
  passwordConfirmation: string;
  agreedToTerms: boolean;
};

type OnboardingCreatePasswordScreenProps = StackScreenProps<
  OnboardingStackParamList,
  "CreatePassword"
>;

function OnboardingCreatePasswordScreen({
  navigation,
}: OnboardingCreatePasswordScreenProps) {
  const { setOnboardingData } = useOnboarding();

  const { control, handleSubmit, formState, watch } =
    useForm<CreatePasswordFormData>();
  const { errors, isValid } = formState;

  const onSubmit = ({ password }: CreatePasswordFormData) => {
    setOnboardingData({ password, complete: true });
    navigation.push("CreateAccountLoading");
  };

  const nextInputRef = useRef<TextInput>(null);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={78}
    >
      <OnboardingScreen
        title="Create a password"
        subtitle="It should be at least 8 characters. You'll need this to unlock Backpack."
      >
        <View style={{ flex: 1, justifyContent: "flex-start" }}>
          <Margin bottom={12}>
            <PasswordInput
              autoFocus
              name="password"
              placeholder="Password"
              control={control}
              returnKeyType="next"
              onSubmitEditing={() => {
                nextInputRef.current?.focus();
              }}
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
            ref={nextInputRef}
            name="passwordConfirmation"
            placeholder="Confirm Password"
            control={control}
            returnKeyType="done"
            onSubmitEditing={handleSubmit(onSubmit)}
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

        <View style={{ alignSelf: "center" }}>
          <Margin bottom={18}>
            <ControlledCheckBoxLabel
              name="agreedToTerms"
              control={control}
              label="I agree to the terms of service"
            />
            <ErrorMessage for={errors.agreedToTerms} />
          </Margin>
        </View>
        <PrimaryButton
          disabled={!isValid}
          label="Next"
          onPress={handleSubmit(onSubmit)}
        />
      </OnboardingScreen>
    </KeyboardAvoidingView>
  );
}

type CreateAccountLoadingScreenProps = StackScreenProps<
  OnboardingStackParamList,
  "CreateAccountLoading"
>;

function CreateAccountLoadingScreen(
  _p: CreateAccountLoadingScreenProps
): JSX.Element | null {
  const { setAuthToken, appState, setAppState } = useSession();
  const { onboardingData, maybeCreateUser } = useOnboarding();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const isAddingAccount = appState === "isAddingAccount";

  maybeLog("on1:CreateAccountLoadingScreen:error", error);
  maybeLog("on1:CreateAccountLoadingScreen:loading", loading);

  const completeOnboarding = useCallback(async () => {
    const data = {
      ...onboardingData,
      isAddingAccount,
      keyringType: onboardingData.keyringType || "mnemonic",
    };

    maybeLog("on1:CreateAccountLoadingScreen:data", data);
    const res = await maybeCreateUser(data);
    maybeLog("on1:CreateAccountLoadingScreen:res", res);

    if (!res.ok) {
      setError(true);
      setLoading(false);
    } else {
      setLoading(false);
      if (isAddingAccount) {
        setAppState("onboardingComplete");
      }
      setAuthToken(res.jwt);
    }
  }, [
    isAddingAccount,
    setAppState,
    setError,
    setLoading,
    maybeCreateUser,
    onboardingData,
    setAuthToken,
  ]);

  useEffect(() => {
    completeOnboarding();
  }, [completeOnboarding]);

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <EmptyState
          icon={(props: any) => <MaterialIcons name="error" {...props} />}
          title="Something went wrong."
          subtitle="Please get in touch ASAP or try again"
          buttonText="Start Over"
          onPress={() => {
            DevSettings.reload();
          }}
        />
      </View>
    );
  }

  if (loading) {
    return <FullScreenLoading label="Creating your wallet..." />;
  }

  return null;
}

export function OnboardingCompleteWelcome({
  onComplete,
}: {
  onComplete: () => void;
}): JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <OnboardingScreen
      title="You've set up Backpack!"
      subtitle="We recommend downloading a few xNFTs to get started."
      style={{
        paddingTop: insets.top + 36,
        paddingBottom: insets.bottom + 24,
      }}
    >
      <View>
        <Margin bottom={8}>
          <CallToAction
            icon={<WidgetIcon />}
            title="Browse the xNFT library"
            onPress={() => Linking.openUrl(XNFT_GG_LINK)}
          />
        </Margin>
        <Margin bottom={8}>
          <CallToAction
            icon={<TwitterIcon />}
            title="Follow us on Twitter"
            onPress={() => Linking.openUrl(TWITTER_LINK)}
          />
        </Margin>
        <CallToAction
          icon={<DiscordIcon />}
          title="Join the Discord"
          onPress={() => Linking.openUrl(DISCORD_INVITE_LINK)}
        />
      </View>
      <View style={{ flex: 1 }} />
      <PrimaryButton disabled={false} label="Finish" onPress={onComplete} />
    </OnboardingScreen>
  );
}

export function OnboardingNavigator({
  onStart,
}: {
  onStart: () => void;
}): JSX.Element {
  useEffect(() => {
    onStart();
    // only run once
  }, []); // eslint-disable-line

  const theme = useTheme();
  return (
    <OnboardingProvider>
      <Stack.Navigator
        initialRouteName="CreateOrRecoverAccount"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen
          name="CreateOrRecoverAccount"
          component={CreateOrRecoverAccountScreen}
        />
        <Stack.Screen
          name="Biometrics"
          component={OnboardingBiometricsScreen}
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
            name="CreateOrRecoverUsername"
            component={CreateOrRecoverUsernameScreen}
          />
          <Stack.Screen
            name="CreateOrImportWallet"
            component={OnboardingCreateOrImportWalletScreen}
          />
          <Stack.Screen
            name="KeyringTypeSelector"
            component={OnboardingKeyringTypeSelectorScreen}
          />
          <Stack.Screen
            name="PrivateKeyInput"
            component={OnboardingPrivateKeyInputScreen}
          />
          <Stack.Screen
            name="MnemonicInput"
            component={OnboardingMnemonicInputScreen}
          />
          <Stack.Screen
            name="MnemonicSearch"
            component={MnemonicSearchScreen}
          />
          <Stack.Screen
            name="SelectBlockchain"
            component={OnboardingBlockchainSelectScreen}
          />
          <Stack.Screen
            name="CreatePassword"
            component={OnboardingCreatePasswordScreen}
          />
          <Stack.Screen
            name="CreateAccountLoading"
            component={CreateAccountLoadingScreen}
            options={{
              headerShown: false,
            }}
          />
        </Stack.Group>
      </Stack.Navigator>
    </OnboardingProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
  },
});

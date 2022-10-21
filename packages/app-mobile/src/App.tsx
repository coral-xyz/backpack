import {
  Blockchain,
  formatUSD,
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
  UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
} from "@coral-xyz/common";
import {
  NotificationsProvider,
  useActiveSolanaWallet,
  useBackgroundClient,
  useBackgroundKeepAlive,
  useBlockchainTokensSorted,
  useKeyringStoreState,
  useSolanaConnectionUrl,
  useTotal,
} from "@coral-xyz/recoil";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { KeyboardAvoidingView, Pressable, Text, View } from "react-native";
import { NativeRouter, Route, Routes, useNavigate } from "react-router-native";
import tw from "twrnc";

import { CustomButton } from "./components/CustomButton";
import { ErrorMessage } from "./components/ErrorMessage";
import { PasswordInput } from "./components/PasswordInput";
import { ButtonFooter, MainContent } from "./components/Templates";
import {
  req_UI_RPC_METHOD_BLOCKCHAINS_ENABLED_ADD,
  req_UI_RPC_METHOD_BLOCKCHAINS_ENABLED_DELETE,
  req_UI_RPC_METHOD_CONNECTION_URL_UPDATE,
  req_UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
  req_UI_RPC_METHOD_KEYRING_EXPORT_MNEMONIC,
  req_UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY,
  req_UI_RPC_METHOD_KEYRING_RESET,
  req_UI_RPC_METHOD_KEYRING_STORE_CHECK_PASSWORD,
  req_UI_RPC_METHOD_KEYRING_STORE_LOCK,
  req_UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS,
  req_UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
  req_UI_RPC_METHOD_PASSWORD_UPDATE,
  req_UI_RPC_METHOD_PREVIEW_PUBKEYS,
  req_UI_RPC_METHOD_SETTINGS_DARK_MODE_UPDATE,
} from "./lib/useRequest";
import { ResetApp } from "./screens/Helpers/ResetApp";
import { ToggleConnection } from "./screens/Helpers/ToggleConnection";
import NeedsOnboarding from "./screens/NeedsOnboarding";
import CreateWallet from "./screens/NeedsOnboarding/CreateWallet";

function RpcTester() {
  const background = useBackgroundClient();
  useEffect(() => {
    async function callStuff() {
      await req_UI_RPC_METHOD_KEYRING_RESET(background);

      await req_UI_RPC_METHOD_KEYRING_STORE_UNLOCK(background, {
        password: "backpack",
      });

      // TODO app-extensions (validateSecretKey)
      // await req_UI_RPC_METHOD_KEYRING_IMPORT_SECRET_KEY(background, {
      //   blockchain: Blockchain.SOLANA,
      //   secretKeyHex: "",
      //   name: "peter6969",
      // });

      await req_UI_RPC_METHOD_KEYRING_STORE_CHECK_PASSWORD(background, {
        password: "backpack",
      });

      await req_UI_RPC_METHOD_KEYRING_EXPORT_MNEMONIC(background, {
        password: "backpack",
      });

      await req_UI_RPC_METHOD_PASSWORD_UPDATE(background, {
        currentPassword: "backpack",
        newPassword: "backpack",
      });

      await req_UI_RPC_METHOD_KEYRING_STORE_READ_ALL_PUBKEYS(background);

      await req_UI_RPC_METHOD_KEYRING_DERIVE_WALLET(background, {
        blockchain: Blockchain.ETHEREUM,
      });

      // TODO derivationpath, mnemonic, etc
      // await req_UI_RPC_METHOD_PREVIEW_PUBKEYS(background, {
      //   mnemonic: "",
      //   derivationPath: "",
      //   blockchain: Blockchain.ETHEREUM,
      // });

      await req_UI_RPC_METHOD_SETTINGS_DARK_MODE_UPDATE(background, {
        isDarkMode: true,
      });

      await req_UI_RPC_METHOD_BLOCKCHAINS_ENABLED_DELETE(background, {
        blockchain: Blockchain.ETHEREUM,
      });

      await req_UI_RPC_METHOD_BLOCKCHAINS_ENABLED_ADD(background, {
        blockchain: Blockchain.ETHEREUM,
      });

      await req_UI_RPC_METHOD_CONNECTION_URL_UPDATE(background, {
        url: "devnet",
      });

      await req_UI_RPC_METHOD_KEYRING_STORE_LOCK(background);
    }

    callStuff();
  }, []);

  return <View style={{ backgroundColor: "red", flex: 1 }} />;
}

const HomeScreen = () => {
  const keyringStoreState = useKeyringStoreState();

  switch (keyringStoreState) {
    case "needs-onboarding":
      return <NeedsOnboarding />;
    case "locked":
      return <LockedScreen />;
    case "unlocked":
      return <UnlockedScreen />;
    default:
      throw new Error("Unknown keyring store state");
  }
};

const UnlockedScreen = () => {
  const background = useBackgroundClient();
  const navigate = useNavigate();
  //  const wallet = useActiveSolanaWallet();

  const tokenAccountsSorted = useBlockchainTokensSorted(Blockchain.SOLANA);
  console.log("***************************");
  console.log("HERE", tokenAccountsSorted);
  console.log("HERE", tokenAccountsSorted[0].mint.toString());
  console.log("***************************");
  //  const connectionUrl = useSolanaConnectionUrl();

  const tokenAccountsFiltered = tokenAccountsSorted.filter(
    (t) => t.displayBalance !== 0
  );

  return (
    <>
      <MainContent>
        <View style={tw`bg-black p-4 rounded-xl`}>
          <Text style={tw`text-white text-xs`}>
            {JSON.stringify(tokenAccountsSorted)}
          </Text>
        </View>

        <Pressable>
          <Text style={tw`text-white text-xs`}>Receive</Text>
          <Text style={tw`text-white text-xs`}>Send</Text>
        </Pressable>

        <View style={tw`bg-black p-4 rounded-xl`}>
          <Text style={tw`text-white text-xs`}>Tokens</Text>
        </View>
      </MainContent>
      <ButtonFooter>
        <CustomButton
          text="Toggle Connection"
          onPress={() => {
            navigate("/toggle-connection");
          }}
        />
        <CustomButton
          text="Lock"
          onPress={async () => {
            await background.request({
              method: UI_RPC_METHOD_KEYRING_STORE_LOCK,
              params: [],
            });
            navigate("/");
          }}
        />
      </ButtonFooter>
    </>
  );
};

interface FormData {
  password: string;
}

const LockedScreen = () => {
  const background = useBackgroundClient();
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>();

  const onSubmit = async ({ password }: FormData) => {
    // TODO: fix issue with uncaught error with incorrect password
    try {
      await req_UI_RPC_METHOD_KEYRING_STORE_LOCK(background);
      await background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
        params: [password],
      });
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("password", { message: "Invalid password" });
    }
  };

  return (
    <>
      <MainContent>
        <Text style={tw`text-white`}>Locked</Text>
        <PasswordInput
          placeholder="Password"
          name="password"
          control={control}
          rules={{
            required: "You must enter a password",
          }}
        />
        <ErrorMessage for={errors.password} />
      </MainContent>
      <ButtonFooter>
        <CustomButton
          text="Reset App"
          onPress={() => {
            navigate("/reset");
          }}
        />
        <CustomButton text="Unlock" onPress={handleSubmit(onSubmit)} />
      </ButtonFooter>
    </>
  );
};

export default function App() {
  useBackgroundKeepAlive();

  return (
    <NativeRouter>
      <NotificationsProvider>
        <RpcTester />
        <KeyboardAvoidingView style={tw`flex-1`} behavior="padding">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/reset" element={<ResetApp />} />
            <Route path="/create-wallet" element={<CreateWallet />} />
            <Route path="/toggle-connection" element={<ToggleConnection />} />
            <Route
              path="/import-wallet"
              element={<CreateWallet importExisting />}
            />
          </Routes>
        </KeyboardAvoidingView>
      </NotificationsProvider>
    </NativeRouter>
  );
}

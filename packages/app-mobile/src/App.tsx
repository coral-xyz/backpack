import { Blockchain } from "@coral-xyz/common";
import {
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
  UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
} from "@coral-xyz/common";
import {
  NotificationsProvider,
  useActiveWallet,
  useBackgroundClient,
  useBackgroundKeepAlive,
  useBlockchainTokensSorted,
  useKeyringStoreState,
  useSolanaConnectionUrl,
  useTotal,
} from "@coral-xyz/recoil";
import { useForm } from "react-hook-form";
import { KeyboardAvoidingView, Text, View } from "react-native";
import { NativeRouter, Route, Routes, useNavigate } from "react-router-native";
import tw from "twrnc";
import { CustomButton } from "./components/CustomButton";
import { ErrorMessage } from "./components/ErrorMessage";
import { PasswordInput } from "./components/PasswordInput";
import { ButtonFooter, MainContent } from "./components/Templates";
import NeedsOnboarding from "./screens/NeedsOnboarding";
import CreateWallet from "./screens/NeedsOnboarding/CreateWallet";
import { ToggleConnection } from "./screens/ToggleConnection";

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
  const wallet = useActiveWallet();
  const { totalBalance, totalChange, percentChange } = useTotal(
    Blockchain.SOLANA
  );
  const tokenAccountsSorted = useBlockchainTokensSorted(Blockchain.SOLANA);
  const connectionUrl = useSolanaConnectionUrl();
  console.log(wallet.publicKey.toString());
  console.log({
    tokenAccountsSorted,
  });

  const tokenAccountsFiltered = tokenAccountsSorted.filter(
    (t: any) => t.nativeBalance !== 0
  );

  return (
    <>
      <MainContent>
        <Text style={tw`text-white text-xs`}>
          Unlocked: {wallet.publicKey.toString()}
        </Text>
        <Text style={tw`text-white text-xs`}>{connectionUrl}</Text>
        <View style={tw`bg-black p-4 rounded-xl`}>
          <Text style={tw`text-white text-xs`}>Tokens</Text>
          <Text style={tw`text-white text-xs`}>
            {JSON.stringify({
              totalBalance,
              totalChange,
              percentChange,
              tokenAccountsFiltered,
            })}
          </Text>
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
        <KeyboardAvoidingView style={tw`flex-1`} behavior="padding">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
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

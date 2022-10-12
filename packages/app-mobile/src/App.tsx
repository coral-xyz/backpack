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
  useTotalBalance,
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
import { ResetApp } from "./screens/Helpers/ResetApp";
import { ToggleConnection } from "./screens/Helpers/ToggleConnection";
import NeedsOnboarding from "./screens/NeedsOnboarding";
import CreateWallet from "./screens/NeedsOnboarding/CreateWallet";

const HomeScreen = () => {
  const keyringStoreState = useKeyringStoreState();
  console.info("mobile-app", JSON.stringify(keyringStoreState));

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
  console.log("mobile-app", "---- UnlockedScreen Init");
  const background = useBackgroundClient();
  console.log("mobile-app", "background", background);
  const navigate = useNavigate();
  console.log("mobile-app", "navigate", navigate);
  const wallet = useActiveSolanaWallet();
  const { totalBalance, totalChange, percentChange } = useTotalBalance();
  // const tokenAccountsSorted = useBlockchainTokensSorted(Blockchain.SOLANA);
  const connectionUrl = useSolanaConnectionUrl();
  console.log("mobile-app", "connectionUrl", connectionUrl);
  console.log("mobile-app", "publicKey", wallet.publicKey.toString());

  // const tokenAccountsFiltered = tokenAccountsSorted.filter(
  //   (t) => t.displayBalance !== "0"
  // );
  // console.log("mobile-app", "tokenAccountsFiltered", tokenAccountsFiltered)

  return <View style={{ flex: 1, backgroundColor: "orange" }} />;
  // return (
  //   <>
  //     <MainContent>
  //       <Text style={tw`text-white text-xs`}>
  //         Unlocked: {wallet.publicKey.toString()}
  //       </Text>
  //       <Text style={tw`text-white text-xs`}>{connectionUrl}</Text>
  //       <View style={tw`bg-black p-4 rounded-xl`}>
  //         <Text style={tw`text-white text-xs`}>
  //           Total Balance: {formatUSD(totalBalance)}
  //         </Text>
  //         {Number.isFinite(percentChange) && (
  //           <>
  //             <Text style={tw`text-white text-xs`}>Last 24 hrs</Text>
  //             <Text style={tw`text-white text-xs`}>
  //               {formatUSD(totalChange)} ({`${percentChange.toFixed(2)}%`})
  //             </Text>
  //           </>
  //         )}
  //       </View>
  //
  //       <Pressable>
  //         <Text style={tw`text-white text-xs`}>Receive</Text>
  //         <Text style={tw`text-white text-xs`}>Send</Text>
  //       </Pressable>
  //
  //       <View style={tw`bg-black p-4 rounded-xl`}>
  //         <Text style={tw`text-white text-xs`}>Tokens</Text>
  //         {tokenAccountsFiltered.map((tokenAccount) => (
  //           <Text style={tw`text-white text-xs`} key={tokenAccount.mint}>
  //             {JSON.stringify(tokenAccount)}
  //           </Text>
  //         ))}
  //       </View>
  //     </MainContent>
  //     <ButtonFooter>
  //       <CustomButton
  //         text="Toggle Connection"
  //         onPress={() => {
  //           navigate("/toggle-connection");
  //         }}
  //       />
  //       <CustomButton
  //         text="Lock"
  //         onPress={async () => {
  //           await background.request({
  //             method: UI_RPC_METHOD_KEYRING_STORE_LOCK,
  //             params: [],
  //           });
  //           navigate("/");
  //         }}
  //       />
  //     </ButtonFooter>
  //   </>
  // );
};

interface FormData {
  password: string;
}

const LockedScreen = () => {
  const background = useBackgroundClient();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      await background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
        params: ["backpack"],
      });
      navigate("/");
    };

    fetchData();
  }, []);

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

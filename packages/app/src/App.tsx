import {
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
  UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
} from "@coral-xyz/common";
import {
  NotificationsProvider,
  useBackgroundClient,
  useBackgroundKeepAlive,
  useKeyringStoreState,
} from "@coral-xyz/recoil";
import { useForm } from "react-hook-form";
import { Text } from "react-native";
import { NativeRouter, Route, Routes, useNavigate } from "react-router-native";
import tw from "twrnc";
import { CustomButton } from "./components/CustomButton";
import { ErrorMessage } from "./components/ErrorMessage";
import { PasswordInput } from "./components/PasswordInput";
import NeedsOnboarding from "./screens/NeedsOnboarding";
import CreateWallet from "./screens/NeedsOnboarding/CreateWallet";

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

  return (
    <>
      <Text style={tw`text-white`}>Unlocked</Text>
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

  const onSubmit = async (data: FormData) => {
    try {
      await background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
        params: [data.password],
      });
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("password", { message: "Invalid password" });
    }
  };

  return (
    <>
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
      <CustomButton text="Unlock" onPress={handleSubmit(onSubmit)} />
    </>
  );
};

export default function App() {
  useBackgroundKeepAlive();

  return (
    <NativeRouter>
      <NotificationsProvider>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/create-wallet" element={<CreateWallet />} />
        </Routes>
      </NotificationsProvider>
    </NativeRouter>
  );
}

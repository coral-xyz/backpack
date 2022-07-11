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
import { Text } from "react-native";
import { NativeRouter, Route, Routes, useNavigate } from "react-router-native";
import tw from "twrnc";
import { CustomButton } from "./components/CustomButton";
import { __TEMPORARY_FIXED_PASSWORD_TO_UNLOCK_BACKPACK__ } from "./lib/toRemove";
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

const LockedScreen = () => {
  const background = useBackgroundClient();
  const navigate = useNavigate();

  return (
    <>
      <Text style={tw`text-white`}>Locked</Text>
      <CustomButton
        text="Unlock"
        onPress={async () => {
          await background.request({
            method: UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
            params: [__TEMPORARY_FIXED_PASSWORD_TO_UNLOCK_BACKPACK__],
          });
          navigate("/");
        }}
      />
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

import { UI_RPC_METHOD_KEYRING_STORE_STATE } from "@coral-xyz/common";
import { useKeyringStoreState } from "@coral-xyz/recoil";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text } from "react-native";
import { Route, Routes } from "react-router-native";
import tw from "twrnc";
import { useRequest } from "./lib/useRequest";
import NeedsOnboarding from "./screens/NeedsOnboarding";
import CreateWallet from "./screens/NeedsOnboarding/CreateWallet";

const Stack = createNativeStackNavigator<any>();

const props: Partial<React.ComponentProps<typeof Stack.Screen>> = {
  options: {
    headerStyle: {
      backgroundColor: "#1D1D20",
    },
    headerTintColor: "#fff",
  },
};

const WithNavigation = () => {
  return (
    <Routes>
      <Route path="/" element={<NeedsOnboarding />} />
      <Route path="/create-wallet" element={<CreateWallet />} />
      <Route path="/final" element={<Final />} />
    </Routes>
  );
};

function Final() {
  const keyringStoreState = useKeyringStoreState();
  console.log("keyring store state", keyringStoreState);

  console.log({ s: useRequest(UI_RPC_METHOD_KEYRING_STORE_STATE) });

  return <Text style={tw`text-white`}>{keyringStoreState}</Text>;
}

export default function App() {
  const keyringStoreState = useKeyringStoreState();
  console.log("keyring store state", keyringStoreState);

  return <WithNavigation />;
}

import {
  Blockchain,
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
  UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
} from "@coral-xyz/common";
import {
  NotificationsProvider,
  // useActiveSolanaWallet,
  useBackgroundClient,
  useBlockchainTokensSorted,
  useKeyringStoreState,
  // useTotal,
} from "@coral-xyz/recoil";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getHeaderTitle } from "@react-navigation/elements";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useForm } from "react-hook-form";
import { Button, Pressable, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";

import { CustomButton } from "./components/CustomButton";
import { ErrorMessage } from "./components/ErrorMessage";
import { PasswordInput } from "./components/PasswordInput";
import { ButtonFooter, MainContent } from "./components/Templates";

function Screen({ children, style }) {
  function getRandomColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: getRandomColor(), ...style }}
    >
      {children}
    </SafeAreaView>
  );
}

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
console.log(Tab);

function BalancesScreen({ navigation }) {
  const background = useBackgroundClient();
  //  const wallet = useActiveSolanaWallet();

  const tokenAccountsSorted = useBlockchainTokensSorted(Blockchain.SOLANA);
  return (
    <Screen>
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
            // navigate("/toggle-connection");
          }}
        />
        <CustomButton
          text="Lock"
          onPress={async () => {
            await background.request({
              method: UI_RPC_METHOD_KEYRING_STORE_LOCK,
              params: [],
            });
            // navigate("/");
          }}
        />
      </ButtonFooter>
    </Screen>
  );
}

function AccountSettingsModal() {
  return (
    <View style={{ flex: 1, backgroundColor: "green", alignItems: "center" }}>
      <Text>Account Settings</Text>
    </View>
  );
}

function RecentActivityModal() {
  return (
    <View style={{ flex: 1, backgroundColor: "green", alignItems: "center" }}>
      <Text>Recent Activity</Text>
    </View>
  );
}

function UnlockedScreen() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        header: ({ navigation, route, options }) => {
          const title = getHeaderTitle(options, route.name);
          return (
            <View
              style={{
                height: 60,
                backgroundColor: "yellow",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text>{title}</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Button
                  onPress={() => navigation.navigate("RecentActivity")}
                  title="Activity"
                />
                <Button
                  onPress={() => navigation.navigate("AccountSettings")}
                  title="Account Settings"
                />
              </View>
            </View>
          );
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Balances") {
            iconName = focused ? "baguette" : "baguette";
          } else if (route.name === "Applications") {
            iconName = focused ? "apps" : "apps";
          } else if (route.name === "Collectibles") {
            iconName = focused ? "image" : "image";
          }

          // You can return any component that you like here!
          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
        tabBarActiveTintColor: "#333",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Balances" component={BalancesScreen} />
      <Tab.Screen name="Applications" component={BalancesScreen} />
      <Tab.Screen name="Collectibles" component={BalancesScreen} />
    </Tab.Navigator>
  );
}

function UnlockedRootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Group>
        <Stack.Screen name="Tabs" component={UnlockedScreen} />
      </Stack.Group>
      <Stack.Group screenOptions={{ presentation: "modal", headerShown: true }}>
        <Stack.Screen name="AccountSettings" component={AccountSettingsModal} />
        <Stack.Screen name="RecentActivity" component={RecentActivityModal} />
      </Stack.Group>
    </Stack.Navigator>
  );
}

interface FormData {
  password: string;
}

const LockedScreen = () => {
  const background = useBackgroundClient();
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
      // navigate("/");
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
            // navigate("/reset");
          }}
        />
        <CustomButton text="Unlock" onPress={handleSubmit(onSubmit)} />
      </ButtonFooter>
    </>
  );
};

function FirstTimeWelcomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "green", alignItems: "center" }}>
      <Text>Welcome to Backpack Create vs. Import Wallet </Text>
    </View>
  );
}

function AppNavigator() {
  const keyringStoreState = useKeyringStoreState();
  console.log("AppNavigator:keyringStoreState", keyringStoreState);

  switch (keyringStoreState) {
    case "needs-onboarding":
      return <FirstTimeWelcomeScreen />;
    case "locked":
      return <LockedScreen />;
    case "unlocked":
      return <UnlockedRootNavigator />;
    default:
      return <View style={{ backgroundColor: "red", flex: 1 }} />;
  }
}

function Providers({ children }) {
  return (
    <NotificationsProvider>
      <SafeAreaProvider>
        <NavigationContainer>{children}</NavigationContainer>
      </SafeAreaProvider>
    </NotificationsProvider>
  );
}

export default function App() {
  return (
    <Providers>
      <AppNavigator />
    </Providers>
  );
}

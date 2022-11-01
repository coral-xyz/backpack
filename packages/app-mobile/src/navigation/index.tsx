import {
  BACKPACK_LINK,
  DISCORD_INVITE_LINK,
  TWITTER_LINK,
  UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
} from "@coral-xyz/common";
import { useBackgroundClient, useKeyringStoreState } from "@coral-xyz/recoil";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Linking } from "expo-linking";
import { useForm } from "react-hook-form";
import { Text, View, Button } from "react-native";
import tw from "twrnc";

import { CustomButton } from "../components/CustomButton";
import { ErrorMessage } from "../components/ErrorMessage";
import { PasswordInput } from "../components/PasswordInput";
import ResetAppButton from "../components/ResetAppButton";
import { ButtonFooter, MainContent } from "../components/Templates";
import OnboardingNavigator from "./OnboardingNavigator";
import UnlockedNavigator from "./UnlockedNavigator";

const Stack = createStackNavigator();

interface FormData {
  password: string;
}

function ListItem({ label, onPress }) {
  return (
    <View
      style={{
        padding: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Button title={label} onPress={onPress} />
    </View>
  );
}

function LockedHelpMenuModal({ navigation }) {
  const options = [
    {
      // icon: <AccountCircleIcon style={{ color: theme.custom.colors.icon }} />,
      text: "Reset Secret Recovery Phrase",
      onPress: () => {
        navigation.push("Reset");
      },
      // onPress: () => nav.push("reset"),
      // suffix: (
      //   <ChevronRightIcon
      //     style={{
      //       flexShrink: 1,
      //       alignSelf: "center",
      //       color: theme.custom.colors.icon,
      //     }}
      //   />
      // ),
    },
    {
      // icon: <LockIcon style={{ color: theme.custom.colors.icon }} />,
      text: "Backpack.app",
      onPress: () => Linking.openURL(BACKPACK_LINK),
    },
    {
      // icon: <TwitterIcon style={{ color: theme.custom.colors.icon }} />,
      text: "Twitter",
      onPress: () => Linking.openURL(TWITTER_LINK),
    },
    {
      // icon: <DiscordIcon fill={theme.custom.colors.icon} />,
      text: "Need help? Hop into Discord",
      onPress: () => Linking.openURL(DISCORD_INVITE_LINK),
    },
  ];
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <View>
        {options.map((o, idx) => (
          <ListItem key={idx} label={o.text} onPress={o.onPress} />
        ))}
      </View>
    </View>
  );
}

function ResetWelcomeScreen({ navigation }) {
  return <View style={{ flex: 1, backgroundColor: "orange" }} />;
}

function LockedNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Locked"
      screenOptions={{ headerTitle: "", presentation: "modal" }}
    >
      <Stack.Screen name="Locked" component={LockedScreen} />
      <Stack.Screen name="HelpMenuModal" component={LockedHelpMenuModal} />
      <Stack.Group>
        <Stack.Screen name="ResetWelcome" component={ResetWelcomeScreen} />
        <Stack.Screen name="ResetWarning" component={LockedScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
}

const LockedScreen = ({ navigation }) => {
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
        <ResetAppButton />
        <CustomButton text="Unlock" onPress={handleSubmit(onSubmit)} />
        <CustomButton
          text="Open Help"
          onPress={() => {
            navigation.push("HelpMenuModal");
          }}
        />
      </ButtonFooter>
    </>
  );
};

export default function Navigation({
  colorScheme,
}: {
  colorScheme: "dark" | "light";
}) {
  return (
    <NavigationContainer
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}

function RootNavigator() {
  const keyringStoreState = useKeyringStoreState();

  switch (keyringStoreState) {
    case "needs-onboarding":
      return <OnboardingNavigator />;
    case "locked":
      return <LockedNavigator />;
    case "unlocked":
      return <UnlockedNavigator />;
    default:
      return <View style={{ backgroundColor: "red", flex: 1 }} />;
  }
}

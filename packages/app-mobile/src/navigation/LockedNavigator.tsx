import { useForm } from "react-hook-form";
import { Alert, Button, Text, View } from "react-native";
import {
  Margin,
  PrimaryButton,
  ResetAppButton,
  Screen,
  SecondaryButton,
  WelcomeLogoHeader,
} from "@components";
import {
  BACKPACK_LINK,
  DISCORD_INVITE_LINK,
  TWITTER_LINK,
  UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { createStackNavigator } from "@react-navigation/stack";
import { Linking } from "expo-linking";
import tw from "twrnc";

import { CustomButton } from "../components/CustomButton";
import { ErrorMessage } from "../components/ErrorMessage";
import { PasswordInput } from "../components/PasswordInput";

const Stack = createStackNavigator();

interface FormData {
  password: string;
}

export default function LockedNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Locked"
      screenOptions={{
        headerShown: false,
        headerTitle: "",
        presentation: "modal",
      }}
    >
      <Stack.Screen name="Locked" component={LockedScreen} />
      <Stack.Screen name="HelpMenuModal" component={LockedHelpMenuModal} />
    </Stack.Navigator>
  );
}

function ResetWelcomeScreen({ navigation }) {
  return <View style={{ flex: 1, backgroundColor: "orange" }} />;
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

const LockedScreen = ({ navigation }) => {
  const background = useBackgroundClient();
  const { control, handleSubmit, formState, setError } = useForm<FormData>();

  const { errors, isValid } = formState;

  const onSubmit = async ({ password }: FormData) => {
    Alert.alert("password", password, formState);
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
    <Screen style={{ justifyContent: "space-between" }}>
      <WelcomeLogoHeader />
      <View>
        <Margin bottom={8}>
          <PasswordInput
            placeholder="Password"
            name="password"
            control={control}
            rules={{
              required: "You must enter a password",
            }}
          />
          {errors.password ? <ErrorMessage for={errors.password} /> : null}
        </Margin>
        <PrimaryButton label="Unlock" onPress={handleSubmit(onSubmit)} />
        <Margin top={24} bottom={8}>
          <SecondaryButton
            label="Open Help"
            onPress={() => {
              navigation.push("HelpMenuModal");
            }}
          />
        </Margin>
        <ResetAppButton />
      </View>
    </Screen>
  );
};

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, DevSettings, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Margin, PrimaryButton, Screen, WelcomeLogoHeader } from "@components";
import {
  BottomSheetHelpModal,
  HelpModalMenuButton,
} from "@components/BottomSheetHelpModal";
import { ErrorMessage } from "@components/ErrorMessage";
import { PasswordInput } from "@components/PasswordInput";
import { UI_RPC_METHOD_KEYRING_STORE_UNLOCK } from "@coral-xyz/common";
import { useBackgroundClient, useUser } from "@coral-xyz/recoil";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@hooks";
import { IconPushDetail } from "@screens/Unlocked/Settings/components/SettingsRow";
import { deleteItemAsync } from "expo-secure-store";

const maybeResetApp = () => {
  Alert.alert(
    "Are your sure?",
    "This will wipe all data that's been stored in the app",
    [
      {
        text: "Yes",
        onPress: () => {
          doReset(true);
        },
      },
      {
        text: "No",
        onPress: () => {},
      },
    ]
  );
};

const doReset = async (shouldReset: boolean) => {
  if (!shouldReset) {
    return;
  }
  // TODO: don't manually specify this list of keys
  const stores = [
    "keyring-store",
    "keyname-store",
    "wallet-data",
    "nav-store7",
  ];
  for (const store of stores) {
    try {
      await deleteItemAsync(store);
    } catch (err) {
      console.error(err);
      // ignore
    }
  }

  DevSettings.reload();
};

interface FormData {
  password: string;
}

export function LockedScreen(): JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const handlePresentModalPress = () => {
    setIsModalVisible((last) => !last);
  };

  // TODO figure out why this isn't working
  // return <View style={{ flex: 1, backgroundColor: "red" }} />;
  // const background = useBackgroundClient();
  // const user = useUser(); // TODO look into why this breaks

  const { control, handleSubmit, formState, setError } = useForm<FormData>();
  const { errors } = formState;

  const onSubmit = async ({ password }: FormData) => {
    // Alert.alert("password", JSON.stringify({ password, formState }));
    // // TODO: fix issue with uncaught error with incorrect password
    // try {
    //   await background.request({
    //     method: UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
    //     params: [password, user.uuid, user.username],
    //   });
    // } catch (err) {
    //   console.error(err);
    //   setError("password", { message: "Invalid password" });
    // }
  };

  const extraOptions = [
    {
      icon: (
        <MaterialIcons
          name="people"
          size={24}
          color={theme.custom.colors.secondary}
        />
      ),
      label: "Reset Backpack",
      detailIcon: <IconPushDetail />,
      onPress: () => {
        maybeResetApp();
      },
    },
  ];

  return (
    <>
      <Screen
        style={[
          styles.container,
          {
            marginTop: insets.top,
            marginBottom: insets.bottom,
          },
        ]}>
        <HelpModalMenuButton onPress={handlePresentModalPress} />
        <Margin top={48} bottom={24}>
          <WelcomeLogoHeader />
        </Margin>
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
        </View>
      </Screen>
      <BottomSheetHelpModal
        extraOptions={extraOptions}
        isVisible={isModalVisible}
        resetVisibility={() => {
          setIsModalVisible(() => false);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
  },
});

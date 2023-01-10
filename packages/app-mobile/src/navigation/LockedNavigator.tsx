import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Alert,
  DevSettings,
  KeyboardAvoidingView,
  StyleSheet,
  View,
} from "react-native";
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
  // TODO figure out why this isn't working
  // return <View style={{ flex: 1, backgroundColor: "red" }} />;
  const background = useBackgroundClient();
  const user = useUser(); // TODO look into why this breaks
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { control, handleSubmit, formState, setError } = useForm<FormData>();

  // TODO errors are broken. They bubble up somewhere. We don't know where
  const onSubmit = async ({ password }: FormData) => {
    try {
      const res = await background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
        params: [password, user.uuid, user.username],
      });
      console.log("UNLOCK_res", res);
    } catch (error) {
      console.log("UNLOCK_error", error);
      setError("password", { message: "Invalid password" });
    }
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
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <Screen
          style={[
            styles.container,
            {
              marginTop: insets.top,
              marginBottom: insets.bottom,
            },
          ]}>
          <HelpModalMenuButton
            onPress={() => {
              setIsModalVisible((last) => !last);
            }}
          />
          <Margin top={48} bottom={24}>
            <WelcomeLogoHeader />
          </Margin>
          <View>
            <Margin bottom={8}>
              <PasswordInput
                returnKeyType="done"
                autoFocus
                placeholder="Password"
                name="password"
                control={control}
                rules={{
                  required: "You must enter a password",
                }}
              />
              {formState.errors.password ? (
                <ErrorMessage for={formState.errors.password} />
              ) : null}
            </Margin>
            <PrimaryButton label="Unlock" onPress={handleSubmit(onSubmit)} />
          </View>
        </Screen>
      </KeyboardAvoidingView>
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

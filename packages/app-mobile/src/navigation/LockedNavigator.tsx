import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Alert,
  DevSettings,
  KeyboardAvoidingView,
  Platform,
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
import {
  UI_RPC_METHOD_KEYRING_STORE_LOCK,
  UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
  useStore,
} from "@coral-xyz/common";
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

function later(delay: number) {
  return new Promise(function (resolve) {
    setTimeout(resolve, delay);
  });
}

export function LockedScreen(): JSX.Element {
  const background = useBackgroundClient();
  const user = useUser(); // TODO look into why this breaks
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { control, handleSubmit, formState, setError } = useForm<FormData>();

  const setLockStatus = useStore((state) => state.setUnlocked);

  const onSubmit = async ({ password }: FormData) => {
    try {
      setLockStatus(false);
      await background.request({
        method: UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
        params: [password, user.uuid, user.username],
      });

      // await later(5000);
      //
      // await background.request({
      //   method: UI_RPC_METHOD_KEYRING_STORE_LOCK,
      //   params: [],
      // });
      //
      // await background.request({
      //   method: UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
      //   params: [password, user.uuid, user.username],
      // });
      // setLockStatus(true);
    } catch (error: any) {
      setError("password", { message: error });
    }
  };

  // Autologin for dev mode
  // useEffect(() => {
  //   async function h() {
  //     if (user.uuid && user.uuid !== "" && user.uuid.length > 5) {
  //       try {
  //         await background.request({
  //           method: UI_RPC_METHOD_KEYRING_STORE_UNLOCK,
  //           params: ["backpack", user.uuid, user.username],
  //         });
  //       } catch (error: any) {
  //         setError("password", { message: error });
  //       }
  //     }
  //   }
  //
  //   h();
  // }, [user.uuid]);

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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}>
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

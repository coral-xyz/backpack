import { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";

import { UI_RPC_METHOD_KEYRING_EXPORT_SECRET_KEY } from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { YStack } from "@coral-xyz/tamagui";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { AvoidSoftInput } from "react-native-avoid-softinput";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EyeIcon, WarningIcon } from "~components/Icon";
import {
  CopyButton,
  DangerButton,
  Header,
  HeaderIconSubtitle,
  Margin,
  Screen,
  SecondaryButton,
  StyledTextInput,
} from "~components/index";
import { useTheme } from "~hooks/useTheme";

import * as Form from "~src/components/Form";
import { PasswordInput } from "~src/components/StyledTextInput";

AvoidSoftInput.setAvoidOffset(88);
AvoidSoftInput.setHideAnimationDelay(100);

const warnings = [
  {
    icon: "chat",
    text: "Backpack support will never ask for your private key.",
  },
  {
    icon: "web",
    text: "Never share your private key or enter it into an app or website.",
  },
  {
    icon: "lock",
    text: "Anyone with your private key will have complete control of your account.",
  },
];

function WarningList() {
  const theme = useTheme();
  return (
    <>
      {warnings.map(({ icon, text }) => (
        <View
          key={text}
          style={[
            {
              backgroundColor: theme.custom.colors.nav,
              borderColor: theme.custom.colors.borderFull,
            },
            styles.listContainer,
          ]}
        >
          <Margin right={12}>
            <MaterialIcons name={icon} size={24} color="#E95050" />
          </Margin>
          <Text
            style={[
              {
                color: theme.custom.colors.fontColor,
              },
              styles.listItem,
            ]}
          >
            {text}
          </Text>
        </View>
      ))}
    </>
  );
}

interface FormData {
  password: string;
}

export function ShowPrivateKeyWarningScreen({
  route,
  navigation,
}): JSX.Element {
  const insets = useSafeAreaInsets();
  const { publicKey } = route.params;
  const background = useBackgroundClient();
  const { control, handleSubmit, formState, setError } = useForm<FormData>();

  const onSubmit = async ({ password }: FormData) => {
    try {
      const privateKey = await background.request({
        method: UI_RPC_METHOD_KEYRING_EXPORT_SECRET_KEY,
        params: [password, publicKey],
      });
      navigation.push("show-private-key", { privateKey });
    } catch (e) {
      console.error(e);
      setError("password", {
        message: "Incorrect password",
      });
    }
  };

  const onFocusEffect = useCallback(() => {
    // This should be run when screen gains focus - enable the module where it's needed
    AvoidSoftInput.setShouldMimicIOSBehavior(true);
    AvoidSoftInput.setEnabled(true);
    return () => {
      // This should be run when screen loses focus - disable the module where it's not needed, to make a cleanup
      AvoidSoftInput.setEnabled(false);
      AvoidSoftInput.setShouldMimicIOSBehavior(false);
    };
  }, []);

  useFocusEffect(onFocusEffect); // register callback to focus events

  return (
    <Screen
      style={{ marginBottom: insets.bottom, justifyContent: "space-between" }}
    >
      <YStack>
        <YStack ai="center" mb={24}>
          <WarningIcon color="$redIcon" />
          <Header text="Warning" />
        </YStack>
        <WarningList />
      </YStack>
      <Form.Wrapper>
        <Form.Group errorMessage={formState.errors.password?.message}>
          <PasswordInput
            onSubmitEditing={handleSubmit(onSubmit)}
            returnKeyType="done"
            placeholder="Password"
            name="password"
            control={control}
            rules={{
              required: "You must enter a password",
            }}
          />
        </Form.Group>
        <DangerButton
          label="Show private key"
          onPress={handleSubmit(onSubmit)}
        />
      </Form.Wrapper>
    </Screen>
  );
}

export function ShowPrivateKeyScreen({ route, navigation }): JSX.Element {
  const { privateKey } = route.params;
  const insets = useSafeAreaInsets();

  const handlePressClose = () => {
    navigation.goBack();
  };

  return (
    <Screen
      style={{
        justifyContent: "space-between",
        marginBottom: insets.bottom,
      }}
    >
      <View>
        <HeaderIconSubtitle
          icon={<EyeIcon />}
          title="Private key"
          subtitle="Never give out your private key"
        />
        <Margin top={16}>
          <Margin bottom={12}>
            <StyledTextInput
              hasError={false}
              style={{ height: 100 }}
              multiline
              value={privateKey}
              editable={false}
            />
          </Margin>
          <CopyButton text={privateKey} />
        </Margin>
      </View>
      <SecondaryButton label="Close" onPress={handlePressClose} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    marginBottom: 12,
    borderWidth: 1,
  },
  listItem: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
});

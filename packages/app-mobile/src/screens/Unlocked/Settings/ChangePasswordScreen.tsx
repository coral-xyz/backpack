import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Margin, PrimaryButton, Screen, SubtextParagraph } from "@components";
import { useTheme } from "@hooks";
import { RoundedContainer } from "@screens/Unlocked/Settings/components/SettingsRow";

function InputGroup({
  hasError,
  children,
}: {
  hasError?: boolean;
  children: JSX.Element | JSX.Element[];
}): JSX.Element {
  const theme = useTheme();
  const borderColor = hasError
    ? theme.custom.colors.negative
    : theme.custom.colors.textInputBorderFull;
  return (
    <View
      style={[
        {
          overflow: "hidden",
          borderRadius: 12,
          borderColor,
          backgroundColor: theme.custom.colors.textBackground,
          borderWidth: 2,
        },
      ]}
    >
      {children}
    </View>
  );
}

function InputListItem({
  autoFocus,
  title,
  placeholder,
  control,
  rules,
  secureTextEntry,
  name,
}: {
  autoFocus?: boolean;
  title: string;
  placeholder?: string;
  control: any;
  rules: any;
  secureTextEntry?: boolean;
  name: string;
}): JSX.Element {
  const theme = useTheme();
  return (
    <View style={[styles.container]}>
      <Text style={styles.label}>{title}</Text>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            autoFocus={autoFocus}
            style={[
              styles.input,
              {
                color: theme.custom.colors.fontColor2,
              },
            ]}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            placeholderTextColor={theme.custom.colors.textPlaceholder}
            secureTextEntry={secureTextEntry}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    paddingLeft: 12,
    width: 80,
    overflow: "hidden",
    ellipsizeMode: "tail",
    fontWeight: "500",
    fontSize: 16,
  },
  input: {
    flex: 1,
    padding: 12,
    fontWeight: "500",
    fontSize: 16,
  },
});

function InstructionText() {
  const theme = useTheme();
  return (
    <Text
      style={{
        fontWeight: "500",
        fontSize: 14,
        lineHeight: 20,
        color: theme.custom.colors.subtext,
      }}
    >
      Your password must be at least 8 characters long and contain letters and
      numbers.
    </Text>
  );
}

export function ChangePasswordScreen({ navigation }) {
  const { control, handleSubmit, formState, watch } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      verifyPassword: "",
    },
  });

  const hasError = (name: string) => !!formState.errors[name];
  const isValid = Object.keys(formState.errors).length === 0;

  const onSubmit = async (data) => {
    Alert.alert("success", JSON.stringify(data));

    // const isCurrentCorrect = await background.request({
    //   method: UI_RPC_METHOD_KEYRING_STORE_CHECK_PASSWORD,
    //   params: [currentPassword],
    // });
    // const mismatchError = newPw1.trim() === "" || newPw1 !== newPw2;
    //
    // setCurrentPasswordError(!isCurrentCorrect);
    // setPasswordMismatchError(mismatchError);
    //
    // if (!isCurrentCorrect || mismatchError) {
    //   return;
    // }
    //
    // await background.request({
    //   method: UI_RPC_METHOD_PASSWORD_UPDATE,
    //   params: [currentPassword, newPw1],
    // });
  };

  const handlePressForgotPassword = () => {
    navigation.navigate("forgot-password");
  };

  return (
    <Screen style={{ justifyContent: "space-between" }}>
      <View>
        <InputGroup hasError={hasError("currentPassword")}>
          <InputListItem
            title="Current"
            placeholder="Enter password"
            name="currentPassword"
            control={control}
            secureTextEntry={true}
            rules={{
              minLength: 8,
              required: true,
            }}
          />
        </InputGroup>
        <Margin top={12} bottom={36}>
          <SubtextParagraph onPress={handlePressForgotPassword}>
            Forgot password?
          </SubtextParagraph>
        </Margin>
        <InputGroup
          hasError={hasError("newPassword") || hasError("verifyPassword")}
        >
          <InputListItem
            title="New"
            placeholder="Enter password"
            name="newPassword"
            secureTextEntry={true}
            control={control}
            rules={{
              minLength: 8,
              required: true,
              validate: (val: string) => {
                if (val === watch("currentPassword")) {
                  return "Your passwords are the same";
                }
              },
            }}
          />
          <InputListItem
            title="Verify"
            placeholder="Re-enter password"
            name="verifyPassword"
            secureTextEntry={true}
            control={control}
            rules={{
              required: true,
              minLength: 8,
              validate: (val: string) => {
                if (val !== watch("newPassword")) {
                  return "Passwords do not match";
                }
              },
            }}
          />
        </InputGroup>
        <Margin top={12}>
          <InstructionText />
        </Margin>
      </View>
      <PrimaryButton
        disabled={!isValid}
        label="Change Password"
        onPress={handleSubmit(onSubmit)}
      />
    </Screen>
  );
}

import { StyleSheet, Text, View } from "react-native";

import { BigNumber } from "ethers";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { InputField, InputFieldMaxLabel } from "~components/Form";
import {
  StyledTokenTextInput,
  Debug,
  Margin,
  PrimaryButton,
  Screen,
} from "~components/index";

export function SwapTokenScreen({ navigation, route }) {
  const handleSwap = () => {};
  const isDisabled = true;
  const insets = useSafeAreaInsets();

  return (
    <Screen
      style={{ justifyContent: "space-between", marginBottom: insets.bottom }}
    >
      <View>
        <InputField
          leftLabel="Sending"
          rightLabelComponent={
            <InputFieldMaxLabel
              label="Max swap:"
              amount={BigNumber.from(0)}
              onSetAmount={console.log}
              decimals={0}
            />
          }
        >
          <StyledTokenTextInput
            value={BigNumber.from(20)}
            decimals={0}
            placeholder="0"
            onChangeText={console.log}
          />
        </InputField>
        <InputField leftLabel="Receiving">
          <StyledTokenTextInput
            value={BigNumber.from(20)}
            decimals={0}
            placeholder="0"
            onChangeText={console.log}
          />
        </InputField>
      </View>

      <PrimaryButton
        disabled={isDisabled}
        label="Review"
        onPress={() => handleSwap()}
      />
    </Screen>
  );
}

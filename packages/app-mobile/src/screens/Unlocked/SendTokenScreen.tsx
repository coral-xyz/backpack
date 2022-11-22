import { View, StyleSheet } from "react-native";
import { useForm } from "react-hook-form";
import { PrimaryButton, Screen } from "@components";
import { TextInput } from "@components/TextInput";
import type { Blockchain } from "@coral-xyz/common";
import {
  ETH_NATIVE_MINT,
  // NAV_COMPONENT_TOKEN,
  SOL_NATIVE_MINT,
  toTitleCase,
  // walletAddressDisplay,
} from "@coral-xyz/common";

import { TokenTables } from "./components/Balances";
import type { Token } from "./components/index";

export function SendTokenModal({ navigation }) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    // watch, used for watching inputs as you type
  } = useForm();

  console.log({ errors });

  const onSubmit = ({ amount, address }) => {
    // console.log("onSubmit", { amount, address });
    // setOnboardingData({ password });
    // navigation.push("Finished");
  };

  return (
    <Screen style={styles.container}>
      <View>
        <TextInput
          placeholder="Wallet address"
          name="address"
          control={control}
          rules={{
            required: "You must enter a valid wallet address",
          }}
        />
        <TextInput
          placeholder="Amount"
          name="amount"
          control={control}
          rules={{
            required: "You must enter a valid amount",
          }}
        />
      </View>
      <PrimaryButton
        disabled={false}
        label="Send"
        onPress={handleSubmit(onSubmit)}
      />
    </Screen>
  );
}

export function SelectSendTokenModal({ navigation }) {
  const onPressTokenRow = (blockchain: Blockchain, token: Token) => {
    navigation.push("SendTokenModal", {
      title: `Send ${toTitleCase(blockchain)} / ${token.ticker}`,
      blockchain,
      tokenAddress: token.address,
      // componentId: NAV_COMPONENT_TOKEN,
    });
  };

  return (
    <Screen>
      <TokenTables
        onPressRow={onPressTokenRow}
        customFilter={(token: Token) => {
          if (token.mint && token.mint === SOL_NATIVE_MINT) {
            return true;
          }
          if (token.address && token.address === ETH_NATIVE_MINT) {
            return true;
          }
          return !token.nativeBalance.isZero();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
  },
});

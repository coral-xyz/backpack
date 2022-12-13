import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  Debug,
  Margin,
  PrimaryButton,
  Screen,
  StyledTextInput,
  TokenInputField,
} from "@components";
import type { Blockchain } from "@coral-xyz/common";
import {
  ETH_NATIVE_MINT,
  NATIVE_ACCOUNT_RENT_EXEMPTION_LAMPORTS,
  SOL_NATIVE_MINT,
  toTitleCase,
} from "@coral-xyz/common";
import { useAnchorContext, useEthereumCtx } from "@coral-xyz/recoil";
import { useIsValidAddress } from "@hooks";
import { BigNumber } from "ethers";

import { TokenTables } from "./components/Balances";
import type { Token } from "./components/index";

export function SendTokenModal({ route }) {
  const { blockchain, token } = route.params;

  const { provider: solanaProvider } = useAnchorContext();
  const ethereumCtx = useEthereumCtx();

  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState<BigNumber | undefined>(undefined);
  const [feeOffset, setFeeOffset] = useState(BigNumber.from(0));

  const onSubmit = () => {
    console.log("onSubmit", { amount, address });
    // setOnboardingData({ password });
    // navigation.push("Finished");
  };

  const {
    isValidAddress,
    isFreshAddress: _,
    isErrorAddress,
    normalizedAddress: destinationAddress,
  } = useIsValidAddress(
    blockchain,
    address,
    solanaProvider.connection,
    ethereumCtx.provider
  );

  useEffect(() => {
    if (!token) return;
    if (token.mint === SOL_NATIVE_MINT) {
      // When sending SOL, account for the tx fee and rent exempt minimum.
      setFeeOffset(
        BigNumber.from(5000).add(
          BigNumber.from(NATIVE_ACCOUNT_RENT_EXEMPTION_LAMPORTS)
        )
      );
    } else if (token.address === ETH_NATIVE_MINT) {
      // 21,000 GWEI for a standard ETH transfer
      setFeeOffset(
        BigNumber.from("21000")
          .mul(ethereumCtx?.feeData.maxFeePerGas!)
          .add(
            BigNumber.from("21000").mul(
              ethereumCtx?.feeData.maxPriorityFeePerGas!
            )
          )
      );
    }
  }, [blockchain, token]);

  const amountSubFee = BigNumber.from(token!.nativeBalance).sub(feeOffset);
  const maxAmount = amountSubFee.gt(0) ? amountSubFee : BigNumber.from(0);
  const exceedsBalance = amount && amount.gt(maxAmount);
  const isSendDisabled = !isValidAddress || amount === null || !!exceedsBalance;
  const isAmountError = amount && exceedsBalance;

  let errorStateWhatever;
  if (isErrorAddress) {
    errorStateWhatever = "Invalid address";
  } else if (isAmountError) {
    errorStateWhatever = "Insufficient Balance";
  }

  return (
    <Screen style={styles.container}>
      <View>
        <Margin bottom={12}>
          <StyledTextInput
            placeholder="Wallet address"
            onChangeText={(address: string) => setAddress(address)}
          />
        </Margin>
        <TokenInputField
          decimals={token.decimals}
          placeholder="Amount"
          // onChangeText={(amount) => setAmount(amount)}
          setValue={setAmount}
          style={{
            borderRadius: 8,
            padding: 8,
            borderWidth: 1,
            borderColor: "#333",
          }}
        />
      </View>
      <PrimaryButton disabled={false} label="Send" onPress={() => onSubmit()} />
    </Screen>
  );
}

export function SelectSendTokenModal({ navigation }) {
  const onPressTokenRow = (blockchain: Blockchain, token: Token) => {
    navigation.push("SendTokenModal", {
      title: `Send ${toTitleCase(blockchain)} / ${token.ticker}`,
      blockchain,
      token,
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

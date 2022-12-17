import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  DangerButton,
  PrimaryButton,
  Screen,
  StyledTextInput,
  StyledTokenTextInput,
} from "@components";
import { InputField, InputFieldMaxLabel } from "@components/Form";
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

import { SearchableTokenTables } from "./components/Balances";
import type { Token } from "./components/index";

export function SendTokenDetailScreen({ route }) {
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

  let sendButton;
  if (isErrorAddress) {
    sendButton = <DangerButton disabled={true} label="Invalid Address" />;
  } else if (isAmountError) {
    sendButton = <DangerButton disabled={true} label="Insufficient Balance" />;
  } else {
    sendButton = (
      <PrimaryButton
        disabled={isSendDisabled}
        label="Send"
        onPress={() => onSubmit()}
      />
    );
  }

  return (
    <Screen style={styles.container}>
      <View>
        <InputField leftLabel="Send to">
          <StyledTextInput
            value={address}
            placeholder={`${toTitleCase(blockchain)} address`}
            onChangeText={(address: string) => setAddress(address.trim())}
          />
        </InputField>
        <InputField
          leftLabel="Amount"
          rightLabelComponent={
            <InputFieldMaxLabel
              amount={maxAmount}
              onSetAmount={setAmount}
              decimals={token.decimals}
            />
          }
        >
          <StyledTokenTextInput
            value={amount}
            decimals={token.decimals}
            placeholder="Amount"
            onChangeText={setAmount}
          />
        </InputField>
      </View>
      {sendButton}
    </Screen>
  );
}

export function SendTokenListScreen({ navigation }) {
  const onPressTokenRow = (blockchain: Blockchain, token: Token) => {
    navigation.push("SendTokenModal", {
      blockchain,
      token,
    });
  };

  return (
    <Screen>
      <SearchableTokenTables
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

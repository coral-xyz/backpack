import type { Blockchain } from "@coral-xyz/common";

import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { Token } from "@@types/types";
import {
  ETH_NATIVE_MINT,
  NATIVE_ACCOUNT_RENT_EXEMPTION_LAMPORTS,
  SOL_NATIVE_MINT,
  toTitleCase,
} from "@coral-xyz/common";
import { useAnchorContext, useEthereumCtx } from "@coral-xyz/recoil";
import { BigNumber } from "ethers";

import { InputField, InputFieldMaxLabel } from "@components/Form";
import {
  DangerButton,
  PrimaryButton,
  Screen,
  StyledTextInput,
  StyledTokenTextInput,
} from "@components/index";
import { useIsValidAddress } from "@hooks/index";

import { SearchableTokenTables } from "./components/Balances";

export function SendTokenDetailScreen({ route }): JSX.Element {
  const { blockchain, token } = route.params;
  console.log("token:Detail", token);
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
  const amountSubFee = BigNumber.from(token.nativeBalance).sub(feeOffset);
  const maxAmount = amountSubFee.gt(0) ? amountSubFee : BigNumber.from(0);
  const exceedsBalance = amount && amount.gt(maxAmount);
  const isSendDisabled = !isValidAddress || amount === null || !!exceedsBalance;
  const isAmountError = amount && exceedsBalance;

  const getButton = useCallback(
    (
      isErrorAddress: boolean,
      isSendDisabled: boolean,
      isAmountError: boolean | undefined
    ): JSX.Element => {
      const handleShowPreviewConfirmation = () => {
        console.log("data");
      };

      if (isErrorAddress) {
        return (
          <DangerButton disabled label="Invalid Address" onPress={() => {}} />
        );
      } else if (isAmountError) {
        return (
          <DangerButton
            disabled
            label="Insufficient Balance"
            onPress={() => {}}
          />
        );
      } else {
        return (
          <PrimaryButton
            disabled={isSendDisabled}
            label="Send"
            onPress={handleShowPreviewConfirmation}
          />
        );
      }
    },
    []
  );

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
      {getButton(isErrorAddress, isSendDisabled, isAmountError)}
    </Screen>
  );
}

export function SendTokenListScreen({ navigation }): JSX.Element {
  return (
    <Screen>
      <SearchableTokenTables
        onPressRow={(blockchain: Blockchain, token: Token) => {
          const title = `Send ${toTitleCase(blockchain)} / ${token.ticker}`;
          navigation.push("SendTokenModal", {
            title,
            blockchain,
            token: {
              ...token,
              nativeBalance: token.nativeBalance.toString(),
            },
          });
        }}
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

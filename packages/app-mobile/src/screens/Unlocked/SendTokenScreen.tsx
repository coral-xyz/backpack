import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import {
  Margin,
  PrimaryButton,
  Screen,
  StyledTextInput,
  TokenInputField,
} from "@components";
import {
  Blockchain,
  ETH_NATIVE_MINT,
  explorerUrl,
  NATIVE_ACCOUNT_RENT_EXEMPTION_LAMPORTS,
  SOL_NATIVE_MINT,
  toTitleCase,
} from "@coral-xyz/common";
import {
  blockchainTokenData,
  TokenData,
  useAnchorContext,
  useBlockchainConnectionUrl,
  useBlockchainExplorer,
  useBlockchainTokenAccount,
  useEthereumCtx,
  useLoader,
  useNavigation,
} from "@coral-xyz/recoil";
import type { Connection } from "@solana/web3.js";
import { PublicKey, SystemProgram } from "@solana/web3.js";
// import { TextInput } from "@components/TextInput";
import { BigNumber, ethers } from "ethers";

import { TokenTables } from "./components/Balances";
import type { Token } from "./components/index";

export function SendTokenModal({ route }) {
  const { blockchain, token } = route.params;

  const { provider: solanaProvider } = useAnchorContext();
  const ethereumCtx = useEthereumCtx();

  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState<BigNumber | undefined>(undefined);
  const [feeOffset, setFeeOffset] = useState(BigNumber.from(0));

  const {
    control,
    handleSubmit,
    formState: { errors },
    // watch, used for watching inputs as you type
  } = useForm();

  console.log({ errors });

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
            onChangeText={(address) => setAddress(address)}
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
      <Text style={{ color: "#FFF" }}>
        {JSON.stringify(
          {
            destinationAddress,
            amountSubFee,
            maxAmount,
            exceedsBalance,
            isSendDisabled,
            isAmountError,
            errorStateWhatever,
            errors,
          },
          null,
          2
        )}
      </Text>
      <PrimaryButton
        disabled={false}
        label="Send"
        onPress={() => handleSubmit()}
      />
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

// TODO(peter) share between extension/mobile
export function useIsValidAddress(
  blockchain: Blockchain,
  address: string,
  solanaConnection?: Connection,
  ethereumProvider?: ethers.providers.Provider
) {
  const [addressError, setAddressError] = useState<boolean>(false);
  const [isFreshAccount, setIsFreshAccount] = useState<boolean>(false); // Not used for now.
  const [accountValidated, setAccountValidated] = useState<boolean>(false);
  const [normalizedAddress, setNormalizedAddress] = useState<string>(address);

  // This effect validates the account address given.
  useEffect(() => {
    if (accountValidated) {
      setAccountValidated(false);
    }
    if (address === "") {
      setAccountValidated(false);
      setAddressError(false);
      return;
    }
    (async () => {
      if (blockchain === Blockchain.SOLANA) {
        let pubkey;

        if (!solanaConnection) {
          return;
        }

        // SNS Domain
        if (address.includes(".sol")) {
          try {
            const hashedName = await getHashedName(address.replace(".sol", ""));
            const nameAccountKey = await getNameAccountKey(
              hashedName,
              undefined,
              new PublicKey("58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx") // SOL TLD Authority
            );

            const owner = await NameRegistryState.retrieve(
              solanaConnection,
              nameAccountKey
            );

            pubkey = owner.registry.owner;
          } catch (e) {
            setAddressError(true);
            return;
          }
        }

        if (!pubkey) {
          // Solana address validation
          try {
            pubkey = new PublicKey(address);
          } catch (err) {
            setAddressError(true);
            // Not valid address so don't bother validating it.
            return;
          }
        }

        const account = await solanaConnection?.getAccountInfo(pubkey);

        // Null data means the account has no lamports. This is valid.
        if (!account) {
          setIsFreshAccount(true);
          setAccountValidated(true);
          setNormalizedAddress(pubkey.toString());
          return;
        }

        // Only allow system program accounts to be given. ATAs only!
        if (!account.owner.equals(SystemProgram.programId)) {
          setAddressError(true);
          return;
        }

        // The account data has been successfully validated.
        setAddressError(false);
        setAccountValidated(true);
        setNormalizedAddress(pubkey.toString());
      } else if (blockchain === Blockchain.ETHEREUM) {
        // Ethereum address validation
        let checksumAddress;

        if (!ethereumProvider) {
          return;
        }

        if (address.includes(".eth")) {
          try {
            checksumAddress = await ethereumProvider?.resolveName(address);
          } catch (e) {
            setAddressError(true);
            return;
          }
        }

        if (!checksumAddress) {
          try {
            checksumAddress = ethers.utils.getAddress(address);
          } catch (e) {
            setAddressError(true);
            return;
          }
        }

        setAddressError(false);
        setAccountValidated(true);
        setNormalizedAddress(checksumAddress);
      }
    })();
  }, [address]);

  return {
    isValidAddress: accountValidated,
    isFreshAddress: isFreshAccount,
    isErrorAddress: addressError,
    normalizedAddress: normalizedAddress,
  };
}

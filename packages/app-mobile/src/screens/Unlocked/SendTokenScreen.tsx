import type { StackScreenProps } from "@react-navigation/stack";

import { useCallback, useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  View,
  Keyboard,
  KeyboardAvoidingView,
  Image,
  Text,
} from "react-native";

import {
  Blockchain,
  ETH_NATIVE_MINT,
  SOL_NATIVE_MINT,
  formatWalletAddress,
  toDisplayBalance,
  NATIVE_ACCOUNT_RENT_EXEMPTION_LAMPORTS,
} from "@coral-xyz/common";
import {
  useAnchorContext,
  useEthereumCtx,
  useIsValidAddress,
} from "@coral-xyz/recoil";
import {
  PrimaryButton,
  DangerButton,
  Box,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";
import { BigNumber } from "ethers";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SendEthereumConfirmationCard } from "~components/BottomDrawerEthereumConfirmation";
import { SendSolanaConfirmationCard } from "~components/BottomDrawerSolanaConfirmation";
import { BetterBottomSheet } from "~components/BottomSheetModal";
import { UnstyledTokenTextInput } from "~components/TokenInputField";
import { UserAvatar } from "~components/UserAvatar";
import { Screen } from "~components/index";
import { useTheme as useCustomTheme } from "~hooks/useTheme";
import type { UnlockedNavigatorStackParamList } from "~navigation/types";

import { SendTokenSelectUserScreen } from "./SendTokenScreen2";
import { SearchableTokenTables } from "./components/Balances";

import { Token } from "~types/types";

export function SendTokenSelectRecipientScreen({
  route,
  navigation,
}: StackScreenProps<
  UnlockedNavigatorStackParamList,
  "SendTokenModal"
>): JSX.Element {
  const [address, setAddress] = useState<string>("");
  const { blockchain, token } = route.params;
  const { provider: solanaProvider } = useAnchorContext();
  const ethereumCtx = useEthereumCtx();

  const {
    isValidAddress,
    _isErrorAddress,
    normalizedAddress: destinationAddress,
  } = useIsValidAddress(
    blockchain,
    address,
    solanaProvider.connection,
    ethereumCtx.provider
  );

  const hasInputError = !isValidAddress && address.length > 15;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Screen style={{ paddingHorizontal: 12, paddingVertical: 16 }}>
        <SendTokenSelectUserScreen
          blockchain={blockchain}
          token={token}
          inputContent={address}
          setInputContent={setAddress}
          hasInputError={hasInputError}
          // selected from the list of available users
          onSelectUserResult={({ user, address }) => {
            // this should error out probably
            if (!address) {
              return;
            }

            navigation.navigate("SendTokenConfirm", {
              blockchain,
              token,
              to: {
                address,
                username: user.username,
                walletName: user.walletName,
                image: user.image,
                uuid: user.uuid,
              },
            });
          }}
          // used the text input to enter in a publickey or username
          onPressNext={({ user }) => {
            navigation.navigate("SendTokenConfirm", {
              blockchain,
              token,
              to: {
                address: destinationAddress,
                username: user?.username,
                image: user?.image,
                uuid: user?.uuid,
              },
            });
          }}
        />
      </Screen>
    </KeyboardAvoidingView>
  );
}

export function SendTokenListScreen({ navigation }): JSX.Element {
  return (
    <Screen>
      <SearchableTokenTables
        onPressRow={(blockchain: Blockchain, token: Token) => {
          navigation.push("SendTokenModal", {
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

function CopyablePublicKey({ address }): JSX.Element {
  const theme = useCustomTheme();
  return (
    <Pressable
      style={{}}
      onPress={async () => {
        console.log("copy clipboard");
      }}
    >
      <Text
        style={{
          fontSize: 13,
          padding: 4,
          backgroundColor: theme.custom.colors.bg2,
        }}
      >
        {formatWalletAddress(address)}
      </Text>
    </Pressable>
  );
}

function AvatarHeader({
  walletName,
  username,
  address,
  image,
}: {
  walletName?: string | undefined;
  username?: string | undefined;
  address?: string | undefined;
  image: string;
}): JSX.Element {
  const theme = useCustomTheme();
  return (
    <YStack ai="center">
      <UserAvatar size={80} uri={image} />
      {walletName || username ? (
        <Text
          style={{
            marginTop: 8,
            color: theme.custom.colors.fontColor,
            fontSize: 16,
            fontWeight: "500",
          }}
        >
          {walletName ? walletName : `@${username}`}
        </Text>
      ) : null}
      <Box mt={8}>
        <CopyablePublicKey address={address} />
      </Box>
    </YStack>
  );
}

function TokenLabel({
  logo,
  ticker,
}: {
  logo: string;
  ticker: string;
}): JSX.Element {
  const theme = useCustomTheme();
  return (
    <XStack ai="center" jc="center" mt={8}>
      <Image
        source={{ uri: logo }}
        style={{
          height: 36,
          width: 36,
          aspectRatio: 1,
          borderRadius: 18,
          marginRight: 6,
        }}
      />
      <Text
        style={{
          fontSize: 24,
          fontWeight: "600",
          color: theme.custom.colors.smallTextColor,
        }}
      >
        {ticker}
      </Text>
    </XStack>
  );
}

function MaxAmountLabel({
  token,
  amount,
  onSetAmount,
}: {
  token: Token;
  amount: BigNumber | null;
  onSetAmount: (amount: BigNumber) => void;
}): JSX.Element {
  const theme = useCustomTheme();
  return (
    <View style={{ alignItems: "center" }}>
      <Pressable
        onPress={() => amount && onSetAmount(amount)}
        style={{
          borderRadius: 8,
          backgroundColor: theme.custom.colors.bg3,
          paddingHorizontal: 12,
          paddingVertical: 4,
          // @ts-ignore
          cursor: "pointer",
          borderColor: theme.custom.colors.borderFull,
        }}
      >
        <Text
          style={{
            color: theme.custom.colors.fontColor,
            fontSize: 14,
          }}
        >
          Max: {amount ? toDisplayBalance(amount, token.decimals) : "0.0"}{" "}
          {token.ticker}
        </Text>
      </Pressable>
    </View>
  );
}

export function SendTokenConfirmScreen({
  navigation,
  route,
}: StackScreenProps<
  UnlockedNavigatorStackParamList,
  "SendTokenConfirm"
>): JSX.Element {
  const theme = useCustomTheme();
  const insets = useSafeAreaInsets();
  const { blockchain, token, to } = route.params;
  const { address, walletName, image, username } = to;
  const ethereumCtx = useEthereumCtx();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [feeOffset, setFeeOffset] = useState<BigNumber>(BigNumber.from(0));
  const [amount, setAmount] = useState<BigNumber | null>(null);

  useEffect(() => {
    if (!token || !ethereumCtx?.feeData) {
      return;
    }
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
  }, [blockchain, token]); // eslint-disable-line

  const amountSubFee = BigNumber.from(token.nativeBalance).sub(feeOffset);
  const maxAmount = amountSubFee.gt(0) ? amountSubFee : BigNumber.from(0);
  const exceedsBalance = amount && amount.gt(maxAmount);
  const isSendDisabled = amount === null || !!exceedsBalance;
  const isAmountError = Boolean(amount && exceedsBalance);

  const getButton = useCallback(
    (isSendDisabled: boolean, isAmountError: boolean): JSX.Element => {
      const handleShowPreviewConfirmation = () => {
        setIsModalVisible(() => true);
        Keyboard.dismiss();
      };

      if (isAmountError) {
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
            label="Review"
            onPress={handleShowPreviewConfirmation}
          />
        );
      }
    },
    []
  );

  const SendConfirmation = {
    [Blockchain.SOLANA]: SendSolanaConfirmationCard,
    [Blockchain.ETHEREUM]: SendEthereumConfirmationCard,
  }[blockchain];

  const destination = {
    address,
    walletName,
    username,
    image,
  };

  return (
    <>
      <Screen
        style={{ justifyContent: "space-between", marginBottom: insets.bottom }}
      >
        <YStack mt={24} f={1}>
          <Box mb={18}>
            <AvatarHeader
              walletName={walletName}
              address={address}
              username={username}
              image={image}
            />
          </Box>
          <UnstyledTokenTextInput
            decimals={token.decimals}
            amount={amount}
            onChangeAmount={setAmount}
            style={{
              fontSize: 48,
              height: 48,
              fontWeight: "600",
              color: theme.custom.colors.fontColor,
              textAlign: "center",
              width: "100%",
            }}
          />
          <Box mb={12}>
            <TokenLabel logo={token.logo} ticker={token.ticker} />
          </Box>
          <MaxAmountLabel
            amount={maxAmount}
            token={token}
            onSetAmount={setAmount}
          />
        </YStack>
        {getButton(isSendDisabled, isAmountError)}
      </Screen>
      <BetterBottomSheet
        isVisible={isModalVisible}
        resetVisibility={() => {
          setIsModalVisible(() => false);
        }}
      >
        <SendConfirmation
          type="token"
          navigation={navigation}
          token={token}
          amount={amount!}
          destination={destination}
          onCompleteStep={(_step: string) => {
            // if (step !== "confirm") {
            //   setModalIndex(() => 1);
            // }
          }}
        />
      </BetterBottomSheet>
    </>
  );
}

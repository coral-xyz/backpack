import { Suspense, useState } from "react";
import { Text, KeyboardAvoidingView, Platform, View } from "react-native";

import { Blockchain } from "@coral-xyz/common";
import {
  useActiveWallet,
  useAnchorContext,
  useEthereumCtx,
  useIsValidAddress,
} from "@coral-xyz/recoil";
import {
  Separator,
  Box,
  YStack,
  StyledText,
  YGroup,
  Image,
  PrimaryButton,
} from "@coral-xyz/tamagui";
import { BigNumber } from "ethers";
import { ErrorBoundary } from "react-error-boundary";

import { SendEthereumConfirmationCard } from "~components/BottomDrawerEthereumConfirmation";
import {
  SendSolanaConfirmationCard,
  ConfirmSendSolanaTable,
} from "~components/BottomDrawerSolanaConfirmation";
import { BetterBottomSheet } from "~components/BottomSheetModal";
import { ListItemLabelValue } from "~components/ListItem";
import { Screen, FullScreenLoading } from "~components/index";

import { SendTokenSelectUserScreen } from "./SendTokenScreen2";

function Container({ navigation, route }): JSX.Element {
  const activeWallet = useActiveWallet();
  const blockchain = activeWallet.blockchain;

  const [to, setTo] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { nft } = route.params;
  const [address, setAddress] = useState<string>("");
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

  const SendConfirmComponent = {
    [Blockchain.SOLANA]: SendSolanaConfirmationCard,
    [Blockchain.ETHEREUM]: SendEthereumConfirmationCard,
  }[activeWallet.blockchain];

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Screen style={{ paddingHorizontal: 12, paddingVertical: 16 }}>
          <SendTokenSelectUserScreen
            blockchain={blockchain}
            token={nft.token}
            inputContent={address}
            setInputContent={setAddress}
            hasInputError={hasInputError}
            onSelectUserResult={({ user, address }) => {
              if (!address) {
                return;
              }

              const to = {
                address: destinationAddress,
                username: user?.username,
                image: user?.image,
                uuid: user?.uuid,
              };

              console.log("debug1:to", to);

              setTo({ to });
              setIsModalVisible(true);
              // navigation.navigate("SendNFTConfirm", {
              //   nft,
              //   to: {
              //     address,
              //     username: user.username,
              //     walletName: user.walletName,
              //     image: user.image,
              //     uuid: user.uuid,
              //   },
              // });
            }}
            onPressNext={({ user }) => {
              const to = {
                address: destinationAddress,
                username: user?.username,
                image: user?.image,
                uuid: user?.uuid,
              };
              console.log("debug1:to", to);
              setTo({ to });
              setIsModalVisible(true);
              // navigation.navigate("SendNFTConfirm", {
              //   nft,
              //   to: {
              //     address: destinationAddress,
              //     username: user?.username,
              //     image: user?.image,
              //     uuid: user?.uuid,
              //   },
              // });
            }}
          />
        </Screen>
      </KeyboardAvoidingView>
      <BetterBottomSheet
        isVisible={isModalVisible}
        resetVisibility={() => setIsModalVisible(false)}
      >
        <SendConfirmComponent
          navigation={navigation}
          token={{
            address: nft.publicKey,
            logo: nft.image,
            decimals: 0,
            mint: nft.mint,
          }}
          // TODO destinationUser
          destinationAddress={to.address}
          amount={BigNumber.from(1)}
          onCompleteStep={(step: string) => {
            if (step !== "confirm") {
            }
          }}
        />
      </BetterBottomSheet>
    </>
  );
}

export function SendCollectibleSendRecipientScreen({
  navigation,
  route,
}: any): JSX.Element {
  return (
    <ErrorBoundary fallbackRender={({ error }) => <Text>{error.message}</Text>}>
      <Suspense fallback={<FullScreenLoading />}>
        <Container navigation={navigation} route={route} />
      </Suspense>
    </ErrorBoundary>
  );
}

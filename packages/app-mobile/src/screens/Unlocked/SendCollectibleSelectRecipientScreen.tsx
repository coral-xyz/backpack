import { Suspense, useState, useMemo } from "react";
import { Text, KeyboardAvoidingView, Platform, View } from "react-native";

import { Blockchain } from "@coral-xyz/common";
import {
  useActiveWallet,
  useAnchorContext,
  useEthereumCtx,
  useIsValidAddress,
} from "@coral-xyz/recoil";
import { BigNumber } from "ethers";
import { ErrorBoundary } from "react-error-boundary";

import { SendEthereumConfirmationCard } from "~components/BottomDrawerEthereumConfirmation";
import {
  SendSolanaConfirmationCard,
  type Destination,
  type TokenTypeCollectible,
} from "~components/BottomDrawerSolanaConfirmation";
import { BetterBottomSheet } from "~components/BottomSheetModal";
import { Screen, FullScreenLoading } from "~components/index";

import { SendTokenSelectUserScreen } from "./SendTokenScreen2";

function Container({ navigation, route }): JSX.Element {
  const activeWallet = useActiveWallet();
  const blockchain = activeWallet.blockchain;
  const [destination, setDestination] = useState<Destination | null>(null);

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

  const SendConfirmation = {
    [Blockchain.SOLANA]: SendSolanaConfirmationCard,
    [Blockchain.ETHEREUM]: SendEthereumConfirmationCard,
  }[activeWallet.blockchain];

  // the names are confusing but necessary for cross-chain work
  // mint is the address
  // token is the ATA
  const tokenToSend = useMemo(
    () => ({
      mint: nft.address,
      address: nft.token,
      image: nft.image,
    }),
    [nft.address, nft.token, nft.image]
  );

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
            // select an address that you see
            onSelectUserResult={({ user, address }) => {
              // this should error out probably
              if (!address) {
                return;
              }

              setDestination({
                address,
                username: user.username,
                image: user.image,
                walletName: user.walletName,
                uuid: user.uuid,
              });

              setIsModalVisible(true);
            }}
            // used the text input to enter in a publickey or username
            onPressNext={({ user }) => {
              setDestination({
                address: destinationAddress,
                username: user?.username,
                image: user?.image,
                walletName: user?.walletName,
                uuid: user?.uuid,
              });
              setIsModalVisible(true);
            }}
          />
        </Screen>
      </KeyboardAvoidingView>
      <BetterBottomSheet
        isVisible={isModalVisible}
        resetVisibility={() => setIsModalVisible(false)}
      >
        <SendConfirmation
          type="nft"
          navigation={navigation}
          token={tokenToSend as TokenTypeCollectible}
          amount={BigNumber.from(1)}
          destination={destination!}
          onCompleteStep={(_step: string) => {
            // if (step !== "confirm") {
            // }
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

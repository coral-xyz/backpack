import { useCallback, useEffect, useState } from "react";
import { Linking, PixelRatio } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApolloClient, useFragment } from "@apollo/client";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { BACKEND_API_URL, UNKNOWN_NFT_ICON_SRC } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import {
  solanaClientAtom,
  useBlockchainConnectionUrl,
  useBlockchainExplorer,
  useTensorMintData,
} from "@coral-xyz/recoil";
import { explorerUrl } from "@coral-xyz/secure-background/legacyCommon";
import { TensorClient } from "@coral-xyz/secure-clients";
import {
  BpPrimaryButton,
  Circle,
  ErrorCrossMarkIcon,
  LinkButton,
  Loader,
  PrimaryButton,
  SecondaryButton,
  Spinner,
  StyledText,
  SuccessCheckMarkIcon,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  TransactionStatus,
} from "@solana/web3.js";
import { Image } from "expo-image";
import { useRecoilValue } from "recoil";
import { useAsyncEffect } from "use-async-effect";

import { ScreenContainer } from "../../../components/ScreenContainer";
import { Routes as SendCollectibleRoutes } from "../../../navigation/SendCollectibleNavigator";
import type { TensorCollectibleActionScreenProps } from "../../../navigation/TensorNavigator";

import { TensorListNftCard } from "./TensorCollectibleListScreen";

// import { NftNodeFragment } from "~src/graphql/fragments";

export function TensorCollectibleActionScreen(
  props: TensorCollectibleActionScreenProps
): JSX.Element {
  return (
    <ScreenContainer loading={<Loading />}>
      <Container {...props} />
    </ScreenContainer>
  );
}

function Loading() {
  // TODO.
  return null;
}

const IMAGE_SIZE = 240;

function Container({
  navigation,
  route,
}: TensorCollectibleActionScreenProps): JSX.Element {
  const {
    ctx: { publicKey, blockchain },
    price,
    mint,
    action,
    description,
    nft,
  } = route.params;

  const { t } = useTranslation();
  const solanaClient = useRecoilValue(solanaClientAtom);
  const [tensorMintData, refetchTensorData] = useTensorMintData(
    mint,
    publicKey,
    blockchain
  );
  const [transactionState, setTransactionState] = useState<
    "creating" | "sending" | "confirming" | "done" | "error"
  >("creating");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const connectionUrl = useBlockchainConnectionUrl(blockchain);
  const explorer = useBlockchainExplorer(blockchain);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const insets = useSafeAreaInsets();

  const data = nft;

  const statusMessages: Record<typeof transactionState, string> = {
    creating: "Creating transaction...",
    sending: "Sending transaction...",
    confirming: "Confirming transaction...",
    done: "Transaction Successful!",
    error: errorMessage ?? "Unknown error.",
  };

  const compressed = !!data.compressed;

  useEffect(() => {
    navigation.setOptions({
      headerTitle: "Tensor Marketplace",
    });
  }, [data, transactionState, navigation, t, description]);

  const execute = useCallback(
    async (retry?: boolean) => {
      if (!tensorMintData || (transactionState !== "creating" && !retry)) {
        return;
      }
      try {
        const tensorClient = new TensorClient();
        const tx = await tensorClient.createTensorTx({
          action,
          publicKey,
          compressed,
          mint,
          price,
          tensorMintData,
        });

        const sig = await solanaClient.wallet.send({
          publicKey: new PublicKey(publicKey),
          tx,
        });

        setTransactionState("confirming");
        setTxSignature(sig);
        await solanaClient.wallet.confirmTransaction(sig);
        refetchTensorData();
        setTransactionState("done");
      } catch (e) {
        const error = e as Error;
        setTransactionState("error");
        if (error?.message) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage(t("failed"));
        }
      }
    },
    [
      action,
      compressed,
      mint,
      price,
      publicKey,
      refetchTensorData,
      solanaClient.wallet,
      t,
      tensorMintData,
      transactionState,
    ]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useAsyncEffect(async () => {
    execute();
  }, []);

  const close = () => {
    if (action === "list" || action === "edit") {
      navigation.popToTop();
      navigation.pop();
    } else {
      navigation.pop();
    }
  };

  return (
    <YStack padding="$4" justifyContent="space-between">
      <YStack paddingTop="$4" space="$8" f={1} backgroundColor="$red">
        <YStack>
          <StyledText textAlign="center">{description}</StyledText>
        </YStack>
        <YStack justifyContent="center" alignItems="center">
          {["creating", "sending", "confirming"].includes(transactionState) ? (
            <Circle
              width={100}
              height={100}
              justifyContent="center"
              alignItems="center"
              borderColor="$accentBlue"
              borderWidth={2}
            >
              <Spinner size="large" color="$accentBlue" />
            </Circle>
          ) : null}
          {transactionState === "done" ? <SuccessCheckMarkIcon /> : null}
          {transactionState === "error" ? <ErrorCrossMarkIcon /> : null}
        </YStack>
        <YStack>
          <StyledText textAlign="center">
            {statusMessages[transactionState]}
          </StyledText>
        </YStack>
        <YStack>
          <TensorListNftCard
            tensorMintData={
              ["edit", "list"].includes(action) ? tensorMintData : undefined
            }
            image={data.image!}
            name={data.name!}
            price={
              price
                ? (parseFloat(price) / LAMPORTS_PER_SOL).toString()
                : undefined
            }
          />
        </YStack>
      </YStack>
      <YStack space="$4" marginBottom={insets.bottom}>
        {transactionState === "creating" ? (
          <YStack>
            <PrimaryButton
              onPress={() => {
                setCancelled(true);
                if (action === "list" || action === "edit") {
                  navigation.popToTop();
                  navigation.pop();
                } else {
                  navigation.pop();
                }
              }}
              label="Cancel"
            />
          </YStack>
        ) : null}
        {transactionState === "error" ? (
          <XStack space="$4">
            <YStack flex={1}>
              <SecondaryButton
                onPress={() => {
                  setCancelled(true);
                  close();
                }}
                label="Cancel"
              />
            </YStack>
            <YStack flex={1}>
              <PrimaryButton
                onPress={() => {
                  setTransactionState("creating");
                  setTxSignature(null);
                  setErrorMessage(null);
                  execute(true);
                }}
                label="Retry"
              />
            </YStack>
          </XStack>
        ) : null}
        {txSignature ? (
          <YStack>
            <LinkButton
              onPress={() => {
                const url = explorerUrl(explorer, txSignature, connectionUrl);
                Linking.openURL(url);
              }}
              label="View in Explorer"
            />
          </YStack>
        ) : null}
        {transactionState === "done" ? (
          <YStack>
            <PrimaryButton
              onPress={() => {
                close();
              }}
              label="Done"
            />
          </YStack>
        ) : null}
      </YStack>
    </YStack>
  );
}

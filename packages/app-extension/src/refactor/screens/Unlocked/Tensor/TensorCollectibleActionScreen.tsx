import { useCallback, useEffect, useState } from "react";
import { Linking, PixelRatio } from "react-native";
import { useApolloClient, useFragment } from "@apollo/client";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { BACKEND_API_URL, UNKNOWN_NFT_ICON_SRC, wait } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import {
  solanaClientAtom,
  tensorProgressAtom,
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
import { useRecoilState, useRecoilValue } from "recoil";
import { useAsyncEffect } from "use-async-effect";

import { ScreenContainer } from "../../../components/ScreenContainer";
import { Routes as SendCollectibleRoutes } from "../../../navigation/SendCollectibleNavigator";
import type { TensorCollectibleActionScreenProps } from "../../../navigation/TensorNavigator";
import { headerLeftCloseButton } from "../../../navigation/utils";

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
    nft: data,
    progressId,
  } = route.params;

  const { t } = useTranslation();
  const [tensorMintData] = useTensorMintData(mint, publicKey, blockchain);
  // const [transactionState, setTransactionState] = useState<
  // "creating" | "sending" | "confirming" | "done" | "error"
  // >("creating");
  const [progress, setProgress] = useRecoilState(
    tensorProgressAtom(progressId)
  );
  const transactionState = progress.progress ?? "creating";
  const txSignature = progress.signature ?? null;
  const errorMessage = progress.error ?? null;

  const connectionUrl = useBlockchainConnectionUrl(blockchain);
  const explorer = useBlockchainExplorer(blockchain);

  // const data = nft;

  const statusMessages: Record<typeof transactionState, string> = {
    creating: t("creating_transaction_dots"),
    sending: t("sending_transaction_dots"),
    confirming: t("confirming_transaction_dots"),
    done: t("transaction_successful"),
    error: errorMessage ?? t("unknown_error"),
  };

  const cancel = progress.cancel;

  useEffect(() => {
    navigation.setOptions({
      headerTitle: t("tensor_marketplace"),
      headerLeft: headerLeftCloseButton(navigation, () => {
        cancel?.();
        navigation.pop();
      }),
    });
  }, [navigation, t, cancel]);

  const close = () => {
    if (action === "list" || action === "edit") {
      navigation.popToTop();
      navigation.pop();
    } else {
      navigation.pop();
    }
  };

  return (
    <YStack padding="$4" space="$4" justifyContent="space-between">
      <YStack
        paddingTop="$4"
        justifyContent="space-between"
        f={1}
        backgroundColor="$red"
      >
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
              ["edit", "list"].includes(action)
                ? tensorMintData.data
                : undefined
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
      <YStack space="$4">
        {/* {transactionState === "creating" ? (
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
              label={t("cancel")}
            />
          </YStack>
        ) : null} */}
        {transactionState === "error" ? (
          <XStack space="$4">
            <YStack flex={1}>
              <SecondaryButton
                onPress={() => {
                  close();
                }}
                label={t("cancel")}
              />
            </YStack>
            <YStack flex={1}>
              <PrimaryButton
                onPress={() => {
                  setProgress((prev) => ({
                    execute: prev.execute,
                    executing: false,
                  }));
                }}
                label={t("retry")}
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
              label={t("view_explorer")}
            />
          </YStack>
        ) : null}
        {transactionState === "done" ? (
          <YStack>
            <PrimaryButton
              onPress={() => {
                close();
              }}
              label={t("done")}
            />
          </YStack>
        ) : null}
      </YStack>
    </YStack>
  );
}

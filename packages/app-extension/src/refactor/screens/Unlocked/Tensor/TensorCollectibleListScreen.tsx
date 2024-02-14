import type { ChangeEvent } from "react";
import React, { useCallback, useRef, useState } from "react";
import { Pressable } from "react-native";
import { useApolloClient } from "@apollo/client";
import { wait } from "@coral-xyz/common";
import { GET_COLLECTIBLES_QUERY } from "@coral-xyz/data-components";
import { useTranslation } from "@coral-xyz/i18n";
import type { TensorProgressAtomType } from "@coral-xyz/recoil";
import {
  solanaClientAtom,
  tensorProgressAtom,
  useActiveWallet,
  useCreateTensorAction,
  useTensorMintData,
} from "@coral-xyz/recoil";
import type { ProviderId } from "@coral-xyz/recoil/src/apollo/graphql";
import type { SolanaClient } from "@coral-xyz/secure-clients";
import { TensorClient } from "@coral-xyz/secure-clients";
import type {
  TensorActions,
  TensorMintDataType,
} from "@coral-xyz/secure-clients/types";
import {
  // ErrorCrossMarkIcon,
  Input,
  PrimaryButton,
  ProxyImage,
  SecondaryButton,
  Stack,
  StyledText,
  TensorLogoIcon,
  useAutoFocusDelay,
  useTheme,
  XStack,
  YStack,
  // SuccessCheckMarkIcon,
  // TensorLogoIcon,
} from "@coral-xyz/tamagui";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import type { BigNumber } from "ethers";
import { ethers } from "ethers";
import { useRecoilState, useRecoilValue } from "recoil";
import { v4 } from "uuid";

import { ScreenContainer } from "../../../components/ScreenContainer";
import type { TensorCollectibleListScreenProps } from "../../../navigation/TensorNavigator";
// import { DecimalHeader } from "~src/components/DecimalHeader";
// import { DecimalPadStrict } from "~src/components/DecimalPad";
import { Routes } from "../../../navigation/TensorNavigator";

export function TensorCollectibleListScreen({
  navigation,
  route,
}: TensorCollectibleListScreenProps): JSX.Element {
  return (
    <ScreenContainer loading={<Loading />}>
      <Container navigation={navigation} route={route} />
    </ScreenContainer>
  );
}

function Loading() {
  // TODO.
  return null;
}

function Container({
  navigation,
  route,
}: TensorCollectibleListScreenProps): JSX.Element {
  const progressId = v4();
  const { t } = useTranslation();
  const solanaClient = useRecoilValue(solanaClientAtom);
  const [progress, setProgress] = useRecoilState(
    tensorProgressAtom(progressId)
  );
  const createAction = useCreateTensorAction();
  const { ctx, nft, price, edit } = route.params;
  const { publicKey, blockchain } = ctx;
  const [decimalValue, setDecimalValue] = useState(price ?? "0");
  const activeWallet = useActiveWallet();
  const apollo = useApolloClient();
  const [tensorMintData, refreshTensorMintData] = useTensorMintData(
    nft.address,
    ctx.publicKey,
    ctx.blockchain
  );
  const compressed = !!nft.compressed;
  const mint = nft.address;
  const nftId = nft.id;

  async function listOnTensor() {
    const action = edit ? "edit" : "list";
    const execute = createAction({
      action,
      publicKey: activeWallet.publicKey,
      mint,
      compressed,
      price: (Number(decimalValue) * LAMPORTS_PER_SOL).toString(),
      tensorMintData: tensorMintData!.data!,
      onDone: async () => {
        refreshTensorMintData();
        await wait(2);
        await apollo.query({
          query: GET_COLLECTIBLES_QUERY,
          fetchPolicy: "network-only",
          variables: {
            address: publicKey,
            providerId: blockchain.toUpperCase() as ProviderId,
          },
        });
      },
    });

    setProgress({ executing: false, execute });

    try {
      navigation.push(Routes.TensorCollectibleActionScreen, {
        ctx: {
          blockchain: ctx.blockchain,
          publicKey: activeWallet.publicKey,
        },
        progressId,
        action: edit ? "edit" : "list",
        mint: nft.address,
        nft: nft,
        price: (Number(decimalValue) * LAMPORTS_PER_SOL).toString(),
        description: edit
          ? t("updating_listing_on_tensor")
          : t("creating_listing_on_tensor"),
      });
      // done no errors
      // setTensorTxStatus(TensorTXStatus.Success);
      // setTxSig(sig);
    } catch (err) {
      console.error("error listing tx", err); // ? should I log this
    }
  }

  return (
    <YStack flex={1} space="$4">
      <YStack jc="center" f={1} padding="$3" space="$5">
        <StyledText textAlign="center">
          {edit ? t("edit_sol_listing_to") : t("list_for_sol")}
        </StyledText>
        <LargeNumericInput
          decimals={9}
          strAmount={decimalValue}
          setStrAmount={setDecimalValue}
          setAmount={() => {}}
        />
        <XStack space="$4" justifyContent="center">
          {tensorMintData.data?.floorPrice ? (
            <Stack
              backgroundColor="$accentBlueBackground"
              borderRadius="$10"
              paddingVertical="$2.5"
              paddingHorizontal="$3.5"
              cursor="pointer"
              onPress={() => {
                setDecimalValue(
                  (
                    parseFloat(tensorMintData.data!.floorPrice!) /
                    LAMPORTS_PER_SOL
                  ).toString()
                );
              }}
            >
              <StyledText color="$accentBlue">{t("floor")}</StyledText>
            </Stack>
          ) : null}
          {tensorMintData.data?.topTrait?.price ? (
            <Stack
              backgroundColor="$accentBlueBackground"
              borderRadius="$10"
              paddingVertical="$2.5"
              paddingHorizontal="$3.5"
              cursor="pointer"
              onPress={() => {
                setDecimalValue(
                  (
                    tensorMintData.data!.topTrait!.price / LAMPORTS_PER_SOL
                  ).toString()
                );
              }}
            >
              <StyledText color="$accentBlue">{t("top_trait")}</StyledText>
            </Stack>
          ) : null}
        </XStack>
      </YStack>
      <YStack marginHorizontal="$4">
        <TensorListNftCard
          edit={!!edit}
          image={nft.image!}
          name={nft.name!}
          price={decimalValue}
          tensorMintData={tensorMintData.data}
        />
      </YStack>
      <YStack mx="$4">
        <XStack mt={16} space={8} mb={16}>
          <PrimaryButton
            label={t("list_nft")}
            onPress={() => listOnTensor()}
            disabled={parseFloat(decimalValue) === 0}
          />
        </XStack>
      </YStack>
    </YStack>
  );
}

export function TensorListNftCard({
  price,
  edit,
  name,
  image,
  stateTextColor,
  tensorMintData,
}: {
  name: string;
  image: string;
  edit?: boolean;
  tensorMintData?: TensorMintDataType | null;
  price?: string;
  stateTextColor?: string;
}) {
  const { t } = useTranslation();

  let displayPrice = undefined;
  let editPrice = undefined;
  if (price) {
    displayPrice = parseFloat(price);
    editPrice = tensorMintData?.activeListing?.listPrice
      ? tensorMintData?.activeListing?.listPrice / LAMPORTS_PER_SOL
      : undefined;

    if (tensorMintData?.platformFeeBPS) {
      displayPrice +=
        (displayPrice * parseFloat(tensorMintData.platformFeeBPS)) / 100_00;
    }
    if (tensorMintData?.sellRoyaltyFeeBPS) {
      displayPrice +=
        (displayPrice * parseFloat(tensorMintData.sellRoyaltyFeeBPS)) / 100_00;
    }
  }

  return (
    <YStack backgroundColor="$baseBackgroundL1" borderRadius="$3" padding="$3">
      <XStack justifyContent="space-between">
        <XStack gap="$3.5">
          <YStack>
            <ProxyImage
              src={image}
              size={300}
              style={{ borderRadius: 8, height: 65, width: 65 }}
            />
          </YStack>
          <YStack justifyContent="space-between">
            <StyledText
              color="$baseTextHighEmphasis"
              fontWeight="500"
              width="fit-content"
            >
              {name}
              {/* {truncate(nft?.name, 20)} */}
            </StyledText>
            {displayPrice && displayPrice > 0 ? (
              <StyledText
                color={stateTextColor ?? "$baseTextMedEmphasis"}
                fontWeight="500"
              >
                {t("price_sol", {
                  price:
                    displayPrice > 1
                      ? displayPrice.toFixed(3)
                      : displayPrice.toFixed(6),
                })}
              </StyledText>
            ) : null}
            {edit && editPrice ? (
              <StyledText
                color={stateTextColor ?? "$baseTextMedEmphasis"}
                fontSize="$sm"
                textDecorationLine={edit ? "line-through" : "none"}
              >
                {t("price_sol", {
                  price:
                    editPrice > 1 ? editPrice.toFixed(3) : editPrice.toFixed(6),
                })}
              </StyledText>
            ) : null}
          </YStack>
        </XStack>
        <XStack>
          <TensorLogoIcon />
        </XStack>
      </XStack>
    </YStack>
  );
}

function LargeNumericInput({
  decimals = 9,
  strAmount,
  setStrAmount,
  setAmount,
}: {
  decimals?: number;
  strAmount: string;
  setStrAmount: (amount: string) => void;
  setAmount: (amount: BigNumber | null) => void;
}) {
  const theme = useTheme();
  const ref = useRef(null);

  // TODO: if this is ever rewritten, try to remove this third 400ms delay
  //       param (or even better, remove the hook, but not holding my breath
  //       for the removal).
  useAutoFocusDelay(ref, true, 400);

  return (
    <input
      ref={ref}
      placeholder="0"
      type="text"
      style={{
        outline: "none",
        background: "transparent",
        border: "none",
        fontWeight: 600,
        fontSize: 54,
        height: 54,
        color: theme.baseTextHighEmphasis.val,
        textAlign: "center",
        width: "100%",
        fontFamily: "Inter, sans-serif",
      }}
      value={strAmount}
      onChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
        try {
          const maxDecimals = decimals;

          let parsedVal = value
            // remove all characters except for 0-9 and .
            .replace(/[^\d.]/g, "")
            // prepend a 0 if . is the first character
            .replace(/^\.(\d+)?$/, "0.$1")
            // remove any periods after the first one
            .replace(/^(\d+\.\d*?)\./, "$1")
            // trim to the number of decimals allowed for the token
            .replace(new RegExp(`^(\\d+\\.\\d{${maxDecimals}}).+`), "$1")
            // remove any leading 0s
            .replace(/^0([1-9]+)/, "$1")
            // only allow one 0 before a .
            .replace(/^0+$/, "0");

          if (!Number.isFinite(Number(parsedVal))) return;

          setStrAmount(parsedVal);

          if (parsedVal.endsWith(".")) {
            // can't `throw new Error("trailing")` due to Error function
            throw "trailing .";
          }

          const finalAmount = ethers.utils.parseUnits(parsedVal, maxDecimals);

          setAmount(finalAmount.isZero() ? null : finalAmount);
        } catch (err) {
          setAmount(null);
        }
      }}
    />
  );
}

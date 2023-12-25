import { useEffect, useState, ReactNode } from "react";

import { UNKNOWN_ICON_SRC } from "@coral-xyz/common";
import { SecureEventOrigin } from "@coral-xyz/secure-background/types";
import {
  AlertOctagonIcon,
  Image,
  BanIcon,
  LinkButton,
  AlertTriangleIcon,
  PencilIcon,
  Stack,
  XStack,
  StyledText,
  YStack,
  Separator,
  Square,
  UserAvatar,
} from "@coral-xyz/tamagui";

import { RenderWallet } from "./RenderWallet";
import { RequestConfirmation } from "./RequestConfirmation";
import { Warning } from "./Warning";
const chunk = <T extends any>(list: T[], size: number): T[][] =>
  [...Array(Math.ceil(list.length / size))].map((_, i) =>
    list.slice(i * size, i * size + size)
  );

type Change = {
  humanReadableDiff: string;
  suggestedColor: "DEBIT" | "CREDIT" | "NONE";
  asset?: {
    isNonFungible: boolean;
    imageUrl: string;
    name: string;
  };
};

export type BlowfishCrossChainResult = {
  action: "BLOCK" | "WARN" | "NONE";
  warnings: {
    severity: "WARNING" | "CRITICAL";
    kind: string;
    message: string;
  }[];
  errors: string[];
  expectedStateChanges?: {
    [account: string]: Change[];
  };
};

function renderHumanReadableDiff(change: Change) {
  const debitActions = ["Send"];
  const creditActions = ["Receive"];

  const action = [...debitActions, ...creditActions].find((action) =>
    change.humanReadableDiff.startsWith(action)
  );
  const assetSide = action
    ? change.humanReadableDiff.replace(`${action} `, "")
    : change.humanReadableDiff;
  const color =
    change.suggestedColor === "DEBIT" ||
    (action && debitActions.includes(action))
      ? "$redText"
      : change.suggestedColor === "CREDIT" ||
        (action && creditActions.includes(action))
      ? "$greenText"
      : "$baseTextHighEmphasis";

  return [
    ...(action
      ? [
          <StyledText key="asset" fontSize="$sm" color={color}>
            {action}
          </StyledText>,
        ]
      : []),
    <StyledText key="asset" fontSize="$sm" color={color}>
      {assetSide}
    </StyledText>,
  ];
}

export function BlowfishTransactionDetails({
  signerPublicKey,
  origin,
  onApprove,
  onDeny,
  evaluation,
  append = [],
  prepend = [],
  customWarnings = [],
}: {
  origin: SecureEventOrigin;
  signerPublicKey: string;
  onApprove: () => void;
  onDeny: () => void;
  evaluation: BlowfishCrossChainResult;
  append?: ReactNode[];
  prepend?: ReactNode[];
  customWarnings?: BlowfishCrossChainResult["warnings"];
}) {
  const [blockIgnored, setBlockIgnored] = useState<boolean>(false);
  useEffect(() => {
    console.log(evaluation);
  }, []);

  if ((false || evaluation.action === "BLOCK") && !blockIgnored) {
    return (
      <BlockingWarning
        warning={
          evaluation.warnings.find(
            (warning) => warning.severity === "CRITICAL"
          )!
        }
        onDeny={onDeny}
        onIgnore={() => setBlockIgnored(true)}
      />
    );
  }

  // const testWarnings: BlowfishCrossChainResult["warnings"] = [
  //   {
  //     severity: "CRITICAL",
  //     message: "This is a bulk approval request. Approvals allow someone else to move your assets on your behalf.",
  //     kind: "wrn"
  //   }
  //   {
  //     severity: "WARNING",
  //     message: "This is a bulk approval request. Approvals allow someone else to move your assets on your behalf.",
  //     kind: "wrn"
  //   }
  // ]

  // assets collected while preparing walletDiffs.
  const assets: {
    [name: string]: {
      isNonFungible: boolean;
      imageUrl: string;
      name: string;
    } | null;
  } = {};
  let hasNFT = false;
  let changeCount = 0;
  let signerIndex = 0;
  const walletDiffs = Object.entries(evaluation.expectedStateChanges ?? {})
    .sort(([publicKeyA, changesA], [publicKeyB, changesB]) => {
      return changesA.length > changesB.length
        ? -1
        : changesA.length < changesB.length
        ? 1
        : publicKeyA > publicKeyB
        ? -1
        : publicKeyA < publicKeyB
        ? 1
        : 0;
    })
    .map(([address, changes], i, all) => {
      // count changes
      changeCount += changes.length;
      const isSigner = address.toLowerCase() === signerPublicKey.toLowerCase();
      const highlightSigner = isSigner && all.length > 1;
      if (isSigner) {
        signerIndex = i;
      }
      return (
        <YStack
          key={address}
          space="$3"
          backgroundColor={
            highlightSigner ? "$baseBackgroundL1" : "$baseBackgroundL0"
          }
          borderColor="$baseBorderMed"
          borderWidth={1}
          padding="$3"
          borderRadius="$4"
        >
          <XStack alignItems="center" justifyContent="space-between" space="$2">
            <XStack flex={1} overflow="hidden">
              <RenderWallet publicKey={address} />
            </XStack>
            {highlightSigner ? (
              <XStack>
                <PencilIcon size="$md" />
              </XStack>
            ) : null}
          </XStack>
          <YStack space="$2">
            {changes.map((change) => {
              // collect signers assets;
              if (isSigner && change.asset) {
                assets[change.asset.name] = change.asset;
                hasNFT = hasNFT || change.asset.isNonFungible;
              }
              return (
                <XStack
                  key={change.humanReadableDiff}
                  alignItems="center"
                  space="$2"
                  flex={1}
                >
                  <XStack
                    alignItems="center"
                    justifyContent="space-between"
                    space="$2"
                    flex={1}
                  >
                    {renderHumanReadableDiff(change)}
                  </XStack>
                  {change.asset ? (
                    <XStack flexShrink={0}>
                      <Image
                        borderRadius={change.asset.isNonFungible ? "$1" : "$6"}
                        source={{
                          width: 22,
                          height: 22,
                          uri: change.asset.imageUrl,
                        }}
                      />
                    </XStack>
                  ) : null}
                </XStack>
              );
            })}
          </YStack>
        </YStack>
      );
    });
  // extract signer diff so it can be shown first.
  const signerDiff = walletDiffs.splice(signerIndex, 1);

  const assetsList = [
    // ...Object.values(assets),
    ...Object.values(assets)
      // if there is an NFT, filter out fungible tokens to only highlight NFTs.
      .filter((asset) => asset && (!hasNFT || asset.isNonFungible)),
  ];
  const assetsPerRow = Math.min(3, assetsList.length);
  const assetRows =
    assetsList.length > 0 ? chunk(assetsList, assetsPerRow) : [];
  const assetSize = assetsList.length > 2 ? 60 : 60;
  if (assetRows.length > 0) {
    assetRows[assetRows.length - 1] = [
      ...assetRows[assetRows.length - 1],
      null,
      null,
    ];
    assetRows[assetRows.length - 1].length = assetsPerRow;
  }

  const originAddress = origin.address;
  const originIcon =
    originAddress.startsWith("http") && !originAddress.includes("localhost")
      ? `https://www.google.com/s2/favicons?domain=${originAddress}&sz=50`
      : UNKNOWN_ICON_SRC;

  return (
    <RequestConfirmation
      title="Confirm Transaction"
      onApprove={onApprove}
      onDeny={onDeny}
    >
      <YStack space="$4">
        {customWarnings.length > 0 ||
        evaluation.warnings.length > 0 ||
        evaluation.errors.length > 0 ? (
          <YStack space="$3">
            {[...evaluation.warnings, ...customWarnings].map((warning) => (
              <Warning key={warning.message} warning={warning} />
            ))}
            {evaluation.errors.map((error) => (
              <Warning
                key={error}
                warning={{
                  severity: "CRITICAL",
                  kind: "error",
                  message: error,
                }}
              />
            ))}
          </YStack>
        ) : null}
        {assetsList.length > 0 ? (
          <YStack space="$4">
            {assetRows.map((assetRow, i) => {
              return (
                <XStack
                  key={assetRow[0]?.name}
                  justifyContent="space-evenly"
                  alignItems="flex-start"
                  flexWrap="nowrap"
                >
                  {assetRow.map((singleAsset, i) => {
                    return (
                      <YStack
                        key={singleAsset?.name ?? i}
                        justifyContent="center"
                        alignItems="center"
                        flexBasis={`${100 / assetRow.length}%`}
                      >
                        {singleAsset ? (
                          <>
                            <Square
                              size={assetSize}
                              borderRadius="$6"
                              circular={!singleAsset.isNonFungible}
                              overflow="hidden"
                              alignItems="center"
                              justifyContent="center"
                              alignContent="stretch"
                            >
                              <Image
                                source={{
                                  width: assetSize,
                                  height: assetSize,
                                  uri: singleAsset.imageUrl,
                                }}
                              />
                            </Square>
                            <StyledText
                              paddingTop="$3"
                              fontSize="$sm"
                              color="$baseTextMedEmphasis"
                              textAlign="center"
                            >
                              {singleAsset.name}
                            </StyledText>
                          </>
                        ) : null}
                      </YStack>
                    );
                  })}
                </XStack>
              );
            })}
          </YStack>
        ) : null}
        {prepend}
        {signerDiff.length + walletDiffs.length > 0 ? (
          <YStack space="$4">
            <StyledText fontWeight="$semiBold" color="$baseTextHighEmphasis">
              Simulation Result
            </StyledText>
            <YStack space="$2">
              {signerDiff}
              {walletDiffs}
            </YStack>
          </YStack>
        ) : null}
        <YStack space="$4">
          <StyledText fontWeight="$semiBold" color="$baseTextHighEmphasis">
            Requested by
          </StyledText>
          <XStack alignItems="center" justifyContent="flex-start" space="$3">
            <Square
              size={24}
              // circular={originAddress !== "https://backpack.app"}
              overflow="hidden"
              alignItems="center"
              justifyContent="center"
              alignContent="stretch"
            >
              <Image
                source={{
                  width: 24,
                  height: 24,
                  uri: originIcon,
                }}
              />
            </Square>
            <YStack space="$1">
              <StyledText fontWeight="$bold" fontSize="$md">
                {new URL(originAddress).host}
              </StyledText>
              <StyledText color="$baseTextMedEmphasis" fontSize="$xs">
                {origin.name}
              </StyledText>
            </YStack>
          </XStack>
        </YStack>
        {append}
      </YStack>
    </RequestConfirmation>
  );
}

export function BlockingWarning({
  onIgnore,
  onDeny,
  warning,
}: {
  onIgnore: (() => void) | null;
  onDeny: () => void;
  warning: BlowfishCrossChainResult["warnings"][number];
}) {
  return (
    <YStack
      backgroundColor={
        warning.severity === "CRITICAL"
          ? "$redBackgroundTransparent"
          : "$yellowBackgroundTransparent"
      }
      f={1}
    >
      <RequestConfirmation
        title="Transaction blocked!"
        onApprove={onDeny}
        rightButton="Close"
        leftButton={
          onIgnore ? (
            <LinkButton onPress={onIgnore} label="Ignore and proceed anyway." />
          ) : null
        }
        buttonDirection="column"
      >
        <YStack f={1} justifyContent="center" alignContent="center">
          <YStack space="$6">
            <Stack alignItems="center">
              {warning.severity === "CRITICAL" ? (
                <AlertOctagonIcon size={64} color="$redIcon" />
              ) : (
                <AlertTriangleIcon size={64} color="$yellowIcon" />
              )}
            </Stack>
            <StyledText
              key={warning.message}
              fontSize="$md"
              textAlign="center"
              fontWeight="$medium"
              lineHeight="$md"
              color={
                warning.severity === "CRITICAL" ? "$redText" : "$yellowText"
              }
            >
              {warning.message}
            </StyledText>
          </YStack>
        </YStack>
      </RequestConfirmation>
    </YStack>
  );
}

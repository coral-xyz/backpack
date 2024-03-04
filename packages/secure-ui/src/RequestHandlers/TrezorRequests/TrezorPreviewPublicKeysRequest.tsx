import { Blockchain } from "@coral-xyz/common";
import {
  BlockchainWalletDescriptorType,
  BlockchainWalletPreviewType,
  BlockchainWalletPublicKeyRequest,
} from "@coral-xyz/secure-background/types";
import {
  HardwareIcon,
  ErrorCrossMarkIcon,
  Loader,
  Progress,
  StyledText,
  YStack,
} from "@coral-xyz/tamagui";
import { PublicKey } from "@solana/web3.js";
import { useCallback, useEffect, useState } from "react";

import { isLegalTrezorPath } from "./_utils/isLegalTrezorPath";
import TrezorConnect from "./_utils/trezorConnect";
import type { QueuedUiRequest } from "../../_atoms/requestAtoms";
import { RequestConfirmation } from "../../_sharedComponents/RequestConfirmation";

type DerivationPaths = {
  blockchain: Blockchain;
  publicKey: string;
  derivationPath: string;
}[];

type FetchWallets = (
  setProgress: (progress: number) => void
) => Promise<DerivationPaths>;

export function TrezorPreviewPublicKeysRequest({
  currentRequest,
}: {
  currentRequest: QueuedUiRequest<"SECURE_USER_PREVIEW_WALLETS">;
}) {
  const request =
    currentRequest.request as BlockchainWalletPublicKeyRequest<BlockchainWalletPreviewType.HARDWARE>;

  const fetchSolanaWallets = useCallback<FetchWallets>(async (setProgress) => {
    const derivationPathBundle = request.derivationPaths
      .filter(isLegalTrezorPath)
      .map((path) => ({
        path,
        showOnTrezor: false,
      }));

    console.log("[DEBUG] [TREZOR] derivationPathBundle", derivationPathBundle);

    const result = await TrezorConnect.solanaGetPublicKey({
      bundle: derivationPathBundle,
    });

    if (result.success === false) {
      throw new Error(result.payload.error);
    }

    const derivationPaths: DerivationPaths = result.payload.map((payload) => ({
      publicKey: payload.publicKey,
      derivationPath: payload.serializedPath,
      blockchain: request.blockchain,
    }));

    console.log(
      "[DEBUG] [TREZOR] derivationPaths",
      Object.values(derivationPaths)
    );

    setProgress(1);
    return Object.values(derivationPaths);
  }, []);

  // TODO: Implement Ethereum
  const fetchEthereumWallets = () => {
    throw new Error("Trezor is not implemented for Ethereum.");
  };

  switch (request.blockchain) {
    case Blockchain.SOLANA:
      return (
        <SelectWallets
          currentRequest={currentRequest}
          fetchWallets={fetchSolanaWallets}
          statuses={["Connect your Trezor", "Fetching public keys"]}
        />
      );
    case Blockchain.ETHEREUM:
      return (
        <SelectWallets
          currentRequest={currentRequest}
          fetchWallets={fetchEthereumWallets}
          statuses={[]}
        />
      );
    default:
      return null;
  }
}

function SelectWallets({
  currentRequest,
  fetchWallets,
  statuses,
}: {
  currentRequest: QueuedUiRequest<"SECURE_USER_PREVIEW_WALLETS">;
  fetchWallets: FetchWallets;
  statuses: string[];
}) {
  const [status, setStatus] = useState("Connect your Trezor.");
  const [progress, setProgress] = useState(0);
  const [isError, setIsError] = useState(false);
  const [isPermissionsError, setIsPermissionsError] = useState(false);

  useEffect(() => {
    const result = fetchWallets(setProgress);
    console.log("[DEBUG] [TREZOR] SelectWallets promise", result);

    result
      .then((result) => {
        console.log("[DEBUG] [TREZOR] SelectWallets result", result);
        currentRequest.respond({
          walletDescriptors: result.map((descriptor) => ({
            ...descriptor,
            type: BlockchainWalletDescriptorType.HARDWARE,
            device: "trezor",
          })),
        });
      })
      .catch((e) => {
        console.log("[DEBUG] [TREZOR] SelectWallets error", e);
        // FIXME: This error can't happen for Trezor.
        // Catch Trezor Errors instead.
        if (e.message === "HID_PERMISSIONS_NOT_AVAILABLE") {
          setIsError(true);
          setIsPermissionsError(true);
          setStatus("Missing HID browser permissions.");
        } else {
          setStatus(e.message);
          setIsError(true);
          setIsPermissionsError(false);
        }
        // currentRequest.error(e instanceof Error ? e : new Error(e));
      });
  }, [currentRequest.id]);

  return (
    <RequestConfirmation
      leftButton="Cancel"
      onApprove={() => {
        window.close();
      }}
      rightButton={isPermissionsError ? "Grant Trezor Permissions" : null}
      onDeny={() => currentRequest.error(new Error("Cancelled by User"))}
      buttonDirection="column-reverse"
    >
      <YStack gap={40}>
        <YStack gap={16}>
          <StyledText fontSize={36} textAlign="center">
            {statuses[0]}
          </StyledText>
          <StyledText color="$baseTextMedEmphasis" textAlign="center">
            {status}
          </StyledText>
        </YStack>
        {isError ? (
          <YStack alignItems="center">
            <ErrorCrossMarkIcon height={100} width={100} />
          </YStack>
        ) : (
          <YStack alignItems="center">
            <Loader thickness={2} size={100} />
            <HardwareIcon
              style={{
                position: "absolute",
                marginTop: 25,
              }}
              height={48}
              width={48}
            />
          </YStack>
        )}

        {status === statuses[1] ? (
          <Progress
            marginTop="$4"
            max={100}
            value={100 * Math.max(progress, 0.001)}
          >
            <Progress.Indicator backgroundColor="$baseBorderFocus" />
          </Progress>
        ) : null}
      </YStack>
    </RequestConfirmation>
  );
}

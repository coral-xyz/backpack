import type { QueuedUiRequest } from "../../_atoms/requestAtoms";

import { useCallback, useEffect, useState } from "react";

import { Blockchain, getEnv, openLedgerPermissions } from "@coral-xyz/common";
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
  Circle,
} from "@coral-xyz/tamagui";
import Ethereum from "@ledgerhq/hw-app-eth";
import Solana from "@ledgerhq/hw-app-solana";
import Transport from "@ledgerhq/hw-transport";
import TransportWebHid from "@ledgerhq/hw-transport-webhid";
import { PublicKey } from "@solana/web3.js";

import { executeLedgerFunction } from "./_utils/executeLedgerFunction";
import { RequestConfirmation } from "../../_sharedComponents/RequestConfirmation";

type DerivationPaths = {
  blockchain: Blockchain;
  publicKey: string;
  derivationPath: string;
}[];

type FetchWallets = (
  transport: Transport,
  setProgress: (progress: number) => void
) => Promise<DerivationPaths>;

export function LedgerPreviewPublicKeysRequest({
  currentRequest,
}: {
  currentRequest: QueuedUiRequest<"SECURE_USER_PREVIEW_WALLETS">;
}) {
  const request =
    currentRequest.request as BlockchainWalletPublicKeyRequest<BlockchainWalletPreviewType.HARDWARE>;

  const fetchSolanaWallets = useCallback<FetchWallets>(
    async (transport, setProgress) => {
      const derivationPaths: DerivationPaths = [];
      // @ts-ignore
      const app = new Solana(transport);

      for (let i = 0; i < request.derivationPaths.length; i++) {
        const derivationPath = request.derivationPaths[i];
        const result = await app.getAddress(derivationPath.replace("m/", ""));
        const publicKey = new PublicKey(result.address).toBase58();
        setProgress(i / request.derivationPaths.length);
        if (!publicKey) {
          continue;
        }
        derivationPaths.push({
          publicKey,
          derivationPath,
          blockchain: currentRequest.request.blockchain,
        });
      }
      return Object.values(derivationPaths);
    },
    []
  );

  const fetchEthereumWallets = useCallback<FetchWallets>(
    async (transport, setProgress) => {
      const derivationPaths: DerivationPaths = [];
      // @ts-ignore
      const app = new Ethereum(transport);

      for (let i = 0; i < request.derivationPaths.length; i++) {
        const derivationPath = request.derivationPaths[i];
        const result = await app.getAddress(derivationPath.replace("m/", ""));
        const publicKey = result.address.toString();
        setProgress(i / request.derivationPaths.length);
        if (!publicKey) {
          continue;
        }
        derivationPaths.push({
          publicKey,
          derivationPath,
          blockchain: currentRequest.request.blockchain,
        });
      }
      return Object.values(derivationPaths);
    },
    []
  );

  switch (request.blockchain) {
    case Blockchain.SOLANA:
      return (
        <SelectWallets
          currentRequest={currentRequest}
          fetchWallets={fetchSolanaWallets}
          statuses={[
            "Connect your Ledger",
            "Unlock your Ledger",
            "Open the Solana App on your Ledger device.",
            "Fetching public keys",
          ]}
        />
      );
    case Blockchain.ETHEREUM:
      return (
        <SelectWallets
          currentRequest={currentRequest}
          fetchWallets={fetchEthereumWallets}
          statuses={[
            "Connect your Ledger",
            "Unlock your Ledger",
            "Open the Ethereum App on your Ledger device.",
            "Fetching public keys",
          ]}
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
  const [status, setStatus] = useState("Connect and unlock your Ledger.");
  const [progress, setProgress] = useState(0);
  const [isError, setIsError] = useState(false);
  const [isPermissionsError, setIsPermissionsError] = useState(false);

  useEffect(() => {
    const [result, cancel] = executeLedgerFunction(
      async () => {
        return TransportWebHid.create();
      },
      (transport, setProgress) => async () =>
        fetchWallets(transport, setProgress),
      (step, progress = 0) => {
        setStatus(statuses[step]);
        if (step === 3 && progress > 0) {
          setProgress(progress);
        }
      }
    );

    currentRequest.addBeforeResponseHandler(async () =>
      cancel(new Error("Plugin Closed"))
    );

    result
      .then((result) => {
        currentRequest.respond({
          walletDescriptors: result.map((descriptor) => ({
            ...descriptor,
            type: BlockchainWalletDescriptorType.HARDWARE,
            device: "ledger",
          })),
        });
      })
      .catch((e) => {
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
        openLedgerPermissions();
        window.close();
      }}
      rightButton={isPermissionsError ? "Grant Ledger Permissions" : null}
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

        {status === statuses[3] ? (
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

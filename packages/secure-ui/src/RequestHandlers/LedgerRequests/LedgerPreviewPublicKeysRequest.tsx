import type { QueuedUiRequest } from "../../_atoms/requestAtoms";

import { useCallback, useEffect, useState } from "react";

import { Blockchain } from "@coral-xyz/common";
import {
  BlockchainWalletDescriptorType,
  BlockchainWalletPreviewType,
  BlockchainWalletPublicKeyRequest,
} from "@coral-xyz/secure-background/types";
import {
  HardwareIcon,
  Loader,
  PrimaryButton,
  Progress,
  Stack,
  StyledText,
  XStack,
} from "@coral-xyz/tamagui";
import Ethereum from "@ledgerhq/hw-app-eth";
import Solana from "@ledgerhq/hw-app-solana";
import Transport from "@ledgerhq/hw-transport";
import TransportWebHid from "@ledgerhq/hw-transport-webhid";
import { PublicKey } from "@solana/web3.js";
import { useRecoilValue } from "recoil";

import { executeLedgerFunction } from "./_utils/executeLedgerFunction";
import { RequestConfirmation } from "../../_sharedComponents/RequestConfirmation";
import { RequestHeader } from "../../_sharedComponents/RequestHeader";

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
            "Connect your Ledger device",
            "Unlock your Ledger device",
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
            "Connect your Ledger device",
            "Unlock your Ledger device",
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
        currentRequest.error(e instanceof Error ? e : new Error(e));
      });
  }, [currentRequest.id]);

  // blockchainConfig.DerivationPathOptions[0].
  return (
    <RequestConfirmation
      leftButton="Cancel"
      rightButton={null}
      onDeny={() => currentRequest.error(new Error("Cancelled by User"))}
    >
      <Stack h="100%" justifyContent="center" alignItems="center">
        <RequestHeader>Connect to Ledger</RequestHeader>
        <Stack margin="$4">
          <HardwareIcon height={64} width={64} />
        </Stack>
        <Loader />
        <StyledText
          textAlign="center"
          margin="$4"
          marginTop="$6"
          color="$baseTextHighEmphasis"
        >
          {status}
        </StyledText>
        {status === statuses[3] ? (
          <Progress
            marginTop="$4"
            max={100}
            value={100 * Math.max(progress, 0.001)}
          >
            <Progress.Indicator backgroundColor="$baseBorderFocus" />
          </Progress>
        ) : null}
      </Stack>
    </RequestConfirmation>
  );
}

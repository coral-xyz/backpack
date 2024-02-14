import type { QueuedUiRequest } from "../../_atoms/requestAtoms";

import { useCallback, useEffect, useState } from "react";
import { FlatList } from "react-native";

import { Blockchain } from "@coral-xyz/common";
import {
  BlockchainWalletDescriptorType,
  type BlockchainConfig,
  type BlockchainWalletPreviewType,
  type BlockchainWalletPublicKeyRequest,
} from "@coral-xyz/secure-background/types";
import {
  HardwareIcon,
  Loader,
  Progress,
  Stack,
  StyledText,
} from "@coral-xyz/tamagui";
// import Ethereum from "@ledgerhq/hw-app-eth";
import Solana from "@ledgerhq/hw-app-solana";
import TransportBLE from "@ledgerhq/react-native-hw-transport-ble";
import { PublicKey } from "@solana/web3.js";
import { useRecoilState, useRecoilValue } from "recoil";

import { SelectDevice } from "./LedgerSelectDevice";
import { selectedDeviceIdAtom } from "./_atoms/bluetoothDeviceAtoms";
import { executeLedgerFunction } from "./_utils/executeLedgerFunction";
import { RequestConfirmation } from "../../_sharedComponents/RequestConfirmation";
import { RequestHeader } from "../../_sharedComponents/RequestHeader";

type DerivationPaths = {
  blockchain: Blockchain;
  publicKey: string;
  derivationPath: string;
}[];
type FetchWallets = (
  transport: TransportBLE,
  setProgress: (progress: number) => void
) => Promise<DerivationPaths>;

export function LedgerPreviewPublicKeysRequest({
  currentRequest,
}: {
  currentRequest: QueuedUiRequest<"SECURE_USER_PREVIEW_WALLETS">;
}) {
  const request =
    currentRequest.request as BlockchainWalletPublicKeyRequest<BlockchainWalletPreviewType.HARDWARE>;

  const selectedDevice = useRecoilValue(selectedDeviceIdAtom);

  const fetchSolanaWallets = useCallback<FetchWallets>(
    async (transport, setProgress) => {
      const app = new Solana(transport);
      const derivationPaths: DerivationPaths = [];

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
      // const derivationPaths: DerivationPaths = [];
      // // @ts-ignore
      // const app = new Ethereum(transport);

      // for (let i = 0; i < request.derivationPaths.length; i++) {
      //   const derivationPath = request.derivationPaths[i];
      //   const result = await app.getAddress(derivationPath.replace("m/", ""));
      //   const publicKey = result.address.toString();
      //   setProgress(i / request.derivationPaths.length);
      //   if (!publicKey) {
      //     continue;
      //   }
      //   derivationPaths.push({
      //     publicKey,
      //     derivationPath,
      //     blockchain: currentRequest.request.blockchain,
      //   });
      // }
      // return Object.values(derivationPaths);
      return [];
    },
    []
  );

  if (!selectedDevice) {
    return <SelectDevice currentRequest={currentRequest} />;
  }

  switch (currentRequest.request.blockchain) {
    case Blockchain.SOLANA:
      return (
        <SelectWallets
          currentRequest={currentRequest}
          fetchWallets={fetchSolanaWallets}
        />
      );
    case Blockchain.ETHEREUM:
      return (
        <SelectWallets
          currentRequest={currentRequest}
          fetchWallets={fetchEthereumWallets}
        />
      );
    default:
      return null;
  }
}

function SelectWallets({
  currentRequest,
  fetchWallets,
}: {
  currentRequest: QueuedUiRequest<"SECURE_USER_PREVIEW_WALLETS">;
  fetchWallets: FetchWallets;
}) {
  const statuses = [
    "Connect your Ledger device",
    "Unlock your Ledger device",
    "Open the Solana App on your Ledger device.",
    "Fetching public keys",
  ];
  const [status, setStatus] = useState("Connect and unlock your Ledger.");
  const [progress, setProgress] = useState(0);
  const [selectedDeviceId, setSelectedDeviceId] =
    useRecoilState(selectedDeviceIdAtom);

  useEffect(() => {
    if (!selectedDeviceId) {
      setStatus(status[0]);
      return;
    }
    currentRequest.addBeforeResponseHandler(async () =>
      setSelectedDeviceId(null)
    );

    const [result, cancel] = executeLedgerFunction(
      async () => {
        try {
          await TransportBLE.disconnectDevice(selectedDeviceId);
        } catch {}
        return TransportBLE.open(selectedDeviceId);
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
  }, [selectedDeviceId, currentRequest.id]);

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

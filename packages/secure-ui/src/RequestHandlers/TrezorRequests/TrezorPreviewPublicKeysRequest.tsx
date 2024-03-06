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
import { useEffect, useState } from "react";

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

  const fetchSolanaWallets = async () => {
    const derivationPathBundle = request.derivationPaths
      .filter(isLegalTrezorPath)
      .map((path) => ({
        path,
        showOnTrezor: false,
      }));

    console.log("[DEBUG] [TREZOR] derivationPathBundle", derivationPathBundle);

    let retries = 0;
    let success = false;
    let result: { address: string; serializedPath: string }[] = [];

    while (!success && retries < 10) {
      const trezorResponse = await TrezorConnect.solanaGetAddress({
        bundle: derivationPathBundle,
      });

      if (trezorResponse.success) {
        console.log(
          "[DEBUG] [TREZOR] trezorResponse, returning",
          trezorResponse
        );
        success = true;
        result = trezorResponse.payload;
      } else {
        console.log(
          "[DEBUG] [TREZOR] trezorResponse, retrying",
          trezorResponse
        );
        retries++;
      }
    }

    const derivationPaths: DerivationPaths = result.map((payload) => ({
      publicKey: payload.address,
      derivationPath: payload.serializedPath,
      blockchain: request.blockchain,
    }));

    console.log(
      "[DEBUG] [TREZOR] derivationPaths",
      Object.values(derivationPaths)
    );

    return Object.values(derivationPaths);
  };

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
    currentRequest.respond({
      walletDescriptors: [
        {
          publicKey: "BdEB9hfSL9qZbjp5CwkYctVPpn3BWpeaMPBWoEj8y9ZH",
          derivationPath: "m/44'/501'",
          blockchain: "solana",
        },
        {
          publicKey: "ETxHeBBcuw9Yu4dGuP3oXrD12V5RECvmi8ogQ9PkjyVF",
          derivationPath: "m/44'/501'/0'/0'",
          blockchain: "solana",
        },
        {
          publicKey: "2MLmmoKgCrxVEzMeGatnjdABYS5RXsQSNikcWrmnvQna",
          derivationPath: "m/44'/501'/1'/0'",
          blockchain: "solana",
        },
        {
          publicKey: "DNDSiWVRF37n1KgQKRF3yuZNiadoXMCePLWqbuYFfveW",
          derivationPath: "m/44'/501'/2'/0'",
          blockchain: "solana",
        },
        {
          publicKey: "7UJWsKKwM5kTB1dg8hLD7PABdXtDE3MaqQLUk68GRCTF",
          derivationPath: "m/44'/501'/3'/0'",
          blockchain: "solana",
        },
        {
          publicKey: "BihV1HdhfDtiQxoG7fat4BbgnKZ3W8kpZgDPZPZGtgoH",
          derivationPath: "m/44'/501'/4'/0'",
          blockchain: "solana",
        },
        {
          publicKey: "AcpwvpfKX1Mb8ibddaYAZPJ6APxu1j9qmnpQMShqkAUW",
          derivationPath: "m/44'/501'/5'/0'",
          blockchain: "solana",
        },
        {
          publicKey: "GgtGKV9DZstMQ7uKvs1eoWU9DNbrsqLLxUkDSJncfMuN",
          derivationPath: "m/44'/501'/6'/0'",
          blockchain: "solana",
        },
        {
          publicKey: "8Mixr6hLqBbd3kBvY39csJK2HW6TwHsfhjVERbfpTQj6",
          derivationPath: "m/44'/501'/7'/0'",
          blockchain: "solana",
        },
        {
          publicKey: "32D4q91naKFrGLVhnw77FU2h2vMUJzkAZa4eweMFFf4T",
          derivationPath: "m/44'/501'/8'/0'",
          blockchain: "solana",
        },
        {
          publicKey: "DUoqdneN2odimpY5joSfq4tNKYXWUyAoSLRjDzHARKLd",
          derivationPath: "m/44'/501'/9'/0'",
          blockchain: "solana",
        },
        {
          publicKey: "98JrM15LDHAkzKwB3bFdpSDCgTUkrAcVFojX2KsuA8XE",
          derivationPath: "m/44'/501'/0'",
          blockchain: "solana",
        },
        {
          publicKey: "Dwv9FVA12vpbrdayRs5JrbNmTmbxXLbqvrtx6WGjTdPF",
          derivationPath: "m/44'/501'/1'",
          blockchain: "solana",
        },
        {
          publicKey: "J3aNU5PiN5HtMaLmKybYJZoxKTnLMeRRbsWD6K5GQUC",
          derivationPath: "m/44'/501'/2'",
          blockchain: "solana",
        },
        {
          publicKey: "6wjDZt5TSeaApvw8cPNRnGave6kVMuymJntKtzM81681",
          derivationPath: "m/44'/501'/3'",
          blockchain: "solana",
        },
        {
          publicKey: "FC1MSnnpbdKPFGVzcFKwFNfKAubNiZhTcam56vx3sERZ",
          derivationPath: "m/44'/501'/4'",
          blockchain: "solana",
        },
        {
          publicKey: "HYMq9yKFnpp8m56hDAXFCRRnSKLxjhcJ1F1EpbzgvHLU",
          derivationPath: "m/44'/501'/5'",
          blockchain: "solana",
        },
        {
          publicKey: "DYwqcXLmtmwB88c6nKcQQXVEm86h1crkpdi9cPREszkM",
          derivationPath: "m/44'/501'/6'",
          blockchain: "solana",
        },
        {
          publicKey: "Dwq63nu4ySq1A1L9vjWRRtkPCQ47Gd5BAzsQqWefGWfB",
          derivationPath: "m/44'/501'/7'",
          blockchain: "solana",
        },
        {
          publicKey: "9GkDryJG8USX2VSxTQ2Z3b1BAbBJPpGeuXdC7jK4KVXE",
          derivationPath: "m/44'/501'/8'",
          blockchain: "solana",
        },
        {
          publicKey: "53A8isrgEuFz8R41uQtuBQpT5WEAmZ6GoWSNy1jHaFxX",
          derivationPath: "m/44'/501'/9'",
          blockchain: "solana",
        },
      ].map((descriptor) => ({
        ...descriptor,
        blockchain: Blockchain.SOLANA,
        type: BlockchainWalletDescriptorType.HARDWARE,
        device: "trezor",
      })),
    });
    /*
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
    */
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

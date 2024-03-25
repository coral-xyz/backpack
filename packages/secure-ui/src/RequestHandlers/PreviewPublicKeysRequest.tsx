import {
  BlockchainWalletPreviewType,
  BlockchainWalletPublicKeyRequest,
} from "@coral-xyz/secure-background/types";

import { LedgerPreviewPublicKeysRequest } from "./LedgerRequests/LedgerPreviewPublicKeysRequest";
import { TrezorPreviewPublicKeysRequest } from "./TrezorRequests/TrezorPreviewPublicKeysRequest";
import type { QueuedUiRequest } from "../_atoms/requestAtoms";

export function HardwarePreviewPublicKeysRequest({
  currentRequest,
}: {
  currentRequest: QueuedUiRequest<"SECURE_USER_PREVIEW_WALLETS">;
}) {
  const request =
    currentRequest.request as BlockchainWalletPublicKeyRequest<BlockchainWalletPreviewType.HARDWARE>;

  switch (request.device) {
    case "ledger":
      return (
        <LedgerPreviewPublicKeysRequest
          currentRequest={
            currentRequest as QueuedUiRequest<"SECURE_USER_PREVIEW_WALLETS">
          }
        />
      );
    case "trezor":
      return (
        <TrezorPreviewPublicKeysRequest
          currentRequest={
            currentRequest as QueuedUiRequest<"SECURE_USER_PREVIEW_WALLETS">
          }
        />
      );
    default:
      return null;
  }
}

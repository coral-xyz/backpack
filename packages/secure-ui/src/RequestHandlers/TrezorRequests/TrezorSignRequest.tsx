import { openLedgerPermissions } from "@coral-xyz/common";
import type { SECURE_LEDGER_EVENTS } from "@coral-xyz/secure-clients/types";
import {
  Loader,
  StyledText,
  HardwareIcon,
  ErrorCrossMarkIcon,
  YStack,
} from "@coral-xyz/tamagui";
import { encode } from "bs58";
import { useCallback, useEffect, useState } from "react";

import TrezorConnect from "./_utils/trezorConnect";
import { RequireUserUnlocked } from "../../RequireUserUnlocked/RequireUserUnlocked";
import type { QueuedUiRequest } from "../../_atoms/requestAtoms";
import { RequestConfirmation } from "../../_sharedComponents/RequestConfirmation";

type RequestHandlers<Events extends SECURE_LEDGER_EVENTS> = {
  [Event in Events]: (
    currentRequest: QueuedUiRequest<Event>,
    setStatus: (status: string) => void
  ) => Promise<void>;
};

// TODO: Once HW PR merged, this should be fine
export type HardwareSignEvents =
  | "LEDGER_SVM_SIGN_TX"
  | "LEDGER_SVM_SIGN_MESSAGE"
  | "LEDGER_EVM_SIGN_TX"
  | "LEDGER_EVM_SIGN_MESSAGE";

export function TrezorSignRequest({
  currentRequest,
}: {
  currentRequest: QueuedUiRequest<HardwareSignEvents>;
}) {
  return (
    <RequireUserUnlocked
      onReset={() => currentRequest.error(new Error("Login Failed"))}
    >
      <ApproveOnTrezor currentRequest={currentRequest} />
    </RequireUserUnlocked>
  );
}

function ApproveOnTrezor({
  currentRequest,
}: {
  currentRequest: QueuedUiRequest<HardwareSignEvents>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState(
    "Approve Signature on your Trezor device."
  );
  const isPermissionsError = error === "HID_PERMISSIONS_NOT_AVAILABLE";
  const isGestureRequiredError = error === "HID_GESTURE_REQUIRED";
  const execute = useCallback(() => {
    (async function () {
      const handlers: RequestHandlers<HardwareSignEvents> = {
        LEDGER_SVM_SIGN_TX: svmSignTx,
        LEDGER_SVM_SIGN_MESSAGE: svmSignMessage,
        LEDGER_EVM_SIGN_TX: evmSignTx,
        LEDGER_EVM_SIGN_MESSAGE: evmSignMessage,
      };

      const handler = handlers[currentRequest.name];
      // TODO: replace :any
      await handler?.(currentRequest as any, setStatus).catch((e) => {
        if (e.message === "HID_PERMISSIONS_NOT_AVAILABLE") {
          setError(e.message);
          setStatus("Missing HID browser permissions.");
        } else if (e.message === "HID_GESTURE_REQUIRED") {
          setError(e.message);
          setStatus("Ledger Connection lost.");
        } else {
          setStatus(e.message);
          setError(e.message);
          currentRequest.error(e instanceof Error ? e : new Error(e));
        }
      });
    })();
  }, [currentRequest.id]);

  useEffect(() => {
    execute();
  }, [execute]);

  return (
    <RequestConfirmation
      leftButton="Cancel"
      onApprove={() => {
        if (isPermissionsError) {
          openLedgerPermissions();
          window.close();
        }
        if (isGestureRequiredError) {
          setError(null);
          execute();
        }
      }}
      rightButton={
        isPermissionsError
          ? "Grant Ledger Permissions"
          : isGestureRequiredError
            ? "Try again!"
            : null
      }
      onDeny={() => currentRequest.error(new Error("Cancelled by User"))}
      buttonDirection="column-reverse"
    >
      <YStack gap={40}>
        <YStack gap={16}>
          <StyledText fontSize={36} textAlign="center">
            Approve on your Ledger Device
          </StyledText>
          <StyledText color="$baseTextMedEmphasis" textAlign="center">
            {status}
          </StyledText>
        </YStack>
        {error ? (
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
      </YStack>
    </RequestConfirmation>
  );
}

async function svmSignTx(
  currentRequest: QueuedUiRequest<"LEDGER_SVM_SIGN_TX">,
  setStatus: (status: string) => void
) {
  console.log("[DEBUG] [svmSignTx] currentRequest: ", currentRequest);
  // TODO: perhaps move this elsewhere? Keeping it here to keep the data flows unified
  // Transform path into trezor compatible one
  const { derivationPath, txMessage } = currentRequest.request;
  const path = derivationPath.startsWith("m/")
    ? derivationPath
    : `m/${derivationPath}`;
  const result = TrezorConnect.solanaSignTransaction({
    path,
    serializedTx: txMessage,
  });

  console.log("[DEBUG] [svmSignTx] result: ", result);

  // wait for result
  return result.then((result) => {
    if (result.success === false) {
      console.log("[DEBUG] [svmSignTx] error:", result.payload.error);
      throw new Error(result.payload.error);
    }
    console.log(
      "[DEBUG] [svmSignTx] signature, responding:",
      result.payload.signature
    );
    currentRequest.respond({
      signature: encode(Buffer.from(result.payload.signature, "hex")),
    });
  });
}

async function svmSignMessage(
  currentRequest: QueuedUiRequest<"LEDGER_SVM_SIGN_MESSAGE">,
  setStatus: (status: string) => void
) {
  throw new Error("Not implemented");
}

async function evmSignTx(
  currentRequest: QueuedUiRequest<"LEDGER_EVM_SIGN_TX">,
  setStatus: (status: string) => void
) {
  throw new Error("Not implemented");
}

async function evmSignMessage(
  currentRequest: QueuedUiRequest<"LEDGER_EVM_SIGN_MESSAGE">,
  setStatus: (status: string) => void
) {
  throw new Error("Not implemented");
}

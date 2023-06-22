import { useEffect, useState } from "react";
import { UserClient } from "@coral-xyz/secure-background/clients";
import type {
  SECURE_EVENTS,
  TransportReceiver,
  TransportSender,
} from "@coral-xyz/secure-background/types";
import { config as tamaguiConfig, TamaguiProvider } from "@coral-xyz/tamagui";
import { RecoilRoot, useRecoilValue } from "recoil";

import type { QueuedRequest } from "./_atoms/clientAtoms";
import {
  currentRequestAtom,
  secureBackgroundSenderAtom,
  secureUIReceiverAtom,
} from "./_atoms/clientAtoms";
import { ApproveOriginRequest } from "./RequestHandlers/ApproveOriginRequest";
import { SignMessageRequest } from "./RequestHandlers/SignMessageRequest";
import { SignTransactionRequest } from "./RequestHandlers/SignTransactionRequest";
import { UnlockRequest } from "./RequestHandlers/UnlockRequest";

function SecureUIRoot() {
  const currentRequest = useRecoilValue(currentRequestAtom);

  // Without a request, SecureUI does nothing.
  if (!currentRequest) {
    return null;
  }

  return (() => {
    switch (currentRequest.name) {
      case "SECURE_SVM_SIGN_MESSAGE":
        return (
          <SignMessageRequest
            currentRequest={
              currentRequest as QueuedRequest<"SECURE_SVM_SIGN_MESSAGE">
            }
          />
        );
      case "SECURE_USER_APPROVE_ORIGIN":
        return (
          <ApproveOriginRequest
            currentRequest={
              currentRequest as QueuedRequest<"SECURE_USER_APPROVE_ORIGIN">
            }
          />
        );
      case "SECURE_SVM_SIGN_TX":
        return (
          <SignTransactionRequest
            currentRequest={
              currentRequest as QueuedRequest<"SECURE_SVM_SIGN_TX">
            }
          />
        );
      case "SECURE_USER_UNLOCK_KEYRING":
        return (
          <UnlockRequest
            currentRequest={
              currentRequest as QueuedRequest<"SECURE_USER_UNLOCK_KEYRING">
            }
          />
        );
      default:
        return null;
    }
  })();
}

export function SecureUI({
  secureUIReceiver,
  secureBackgroundSender,
}: {
  secureUIReceiver: TransportReceiver<SECURE_EVENTS, "confirmation">;
  secureBackgroundSender: TransportSender<SECURE_EVENTS>;
}) {
  return (
    <RecoilRoot
      initializeState={({ set }) => {
        set(secureBackgroundSenderAtom, secureBackgroundSender);
        set(secureUIReceiverAtom, secureUIReceiver);
      }}
    >
      <TamaguiProvider config={tamaguiConfig}>
        <SecureUIRoot />
      </TamaguiProvider>
    </RecoilRoot>
  );
}

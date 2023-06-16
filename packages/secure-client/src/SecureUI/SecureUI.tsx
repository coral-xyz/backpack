import { useEffect, useState } from "react";
import { UserClient } from "@coral-xyz/secure-background/clients";
import type {
  SECURE_EVENTS,
  TransportReceiver,
  TransportSender,
} from "@coral-xyz/secure-background/types";
import { config as tamaguiConfig, TamaguiProvider } from "@coral-xyz/tamagui";
import { RecoilRoot, useRecoilValue } from "recoil";

import {
  currentRequestAtom,
  secureBackgroundSenderAtom,
  secureUIReceiverAtom,
} from "./_atoms/clientAtoms";
import { SignMessageRequest } from "./RequestHandlers/SignMessageRequest";

function SecureUIRoot() {
  const currentRequest = useRecoilValue(currentRequestAtom);

  // Without a request, SecureUI does nothing.
  if (!currentRequest) {
    return null;
  }

  return (() => {
    switch (currentRequest.name) {
      case "SECURE_SVM_SIGN_MESSAGE":
        return <SignMessageRequest currentRequest={currentRequest} />;
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

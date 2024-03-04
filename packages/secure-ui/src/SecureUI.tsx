import {
  notificationListenerAtom,
  secureBackgroundSenderAtom,
} from "@coral-xyz/recoil";
import type {
  SECURE_EVENTS,
  TransportBroadcastListener,
  TransportReceiver,
  TransportSender,
} from "@coral-xyz/secure-clients/types";
import {
  View,
  config as tamaguiConfig,
  TamaguiProvider,
} from "@coral-xyz/tamagui";
import type { ReactNode } from "react";
import { Suspense, useMemo } from "react";
import { RecoilRoot, useRecoilValueLoadable } from "recoil";

import { Presentation, PresentationTypes } from "./Presentation";
import { QuickTheme } from "./QuickTheme";
import { ApproveOriginRequest } from "./RequestHandlers/ApproveOriginRequest";
import { EvmSignMessageRequest } from "./RequestHandlers/EvmSignMessageRequest";
import { EvmSignTransactionRequest } from "./RequestHandlers/EvmSignTransactionRequest/EvmSignTransactionRequest";
import { ExportBackupRequest } from "./RequestHandlers/ExportBackupRequest";
import { GetMnemonicRequest } from "./RequestHandlers/GetMnemonicRequest";
import {
  LedgerSignEvents,
  LedgerSignRequest,
} from "./RequestHandlers/LedgerRequests/LedgerSignRequest";
import { HardwarePreviewPublicKeysRequest } from "./RequestHandlers/PreviewPublicKeysRequest";
import { ResetBackpackRequest } from "./RequestHandlers/ResetBackpackRequest";
import { SvmSignAllTransactionsRequest } from "./RequestHandlers/SvmSignAllTransactionsRequest";
import { SvmSignInRequest } from "./RequestHandlers/SvmSignInRequest";
import { SvmSignMessageRequest } from "./RequestHandlers/SvmSignMessageRequest";
import { SvmSignTransactionRequest } from "./RequestHandlers/SvmSignTransactionRequest/SvmSignTransactionRequest";
import { UnlockRequest } from "./RequestHandlers/UnlockRequest";
import { RequireUserUnlocked } from "./RequireUserUnlocked/RequireUserUnlocked";
import SecureUIBottomSheetModalProvider from "./SecureUIBottomSheetModalProvider";
import {
  currentRequestAtom,
  secureUIReceiverAtom,
} from "./_atoms/requestAtoms";
import type { QueuedUiRequest } from "./_atoms/requestAtoms";

export function SecureUI({
  timing = 0,
  presentation,
  secureUIReceiver,
  secureBackgroundSender,
  notificationListener,
}: {
  timing?: number;
  secureUIReceiver: TransportReceiver<SECURE_EVENTS, "ui">;
  secureBackgroundSender: TransportSender<SECURE_EVENTS>;
  notificationListener: TransportBroadcastListener;
  presentation?: PresentationTypes;
}) {
  return (
    <RecoilRoot
      initializeState={({ set }) => {
        set(secureBackgroundSenderAtom, secureBackgroundSender);
        set(secureUIReceiverAtom, secureUIReceiver);
        set(notificationListenerAtom, notificationListener);
      }}
    >
      <Suspense fallback={null}>
        <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
          <SecureUIBottomSheetModalProvider>
            <SecureUIRoot presentation={presentation} />
          </SecureUIBottomSheetModalProvider>
        </TamaguiProvider>
      </Suspense>
    </RecoilRoot>
  );
}

function SecureUIRoot({ presentation }: { presentation?: PresentationTypes }) {
  const currentRequestLoadable = useRecoilValueLoadable(currentRequestAtom);
  const currentRequest = currentRequestLoadable.getValue();

  console.log("[DEBUG] [SecureUIRoot] currentRequest: ", currentRequest);

  return (
    <Presentation presentation={presentation} currentRequest={currentRequest}>
      {currentRequest
        ? (() => {
            switch (currentRequest.name) {
              case "SECURE_USER_APPROVE_ORIGIN":
                return (
                  <ApproveOriginRequest
                    currentRequest={
                      currentRequest as QueuedUiRequest<"SECURE_USER_APPROVE_ORIGIN">
                    }
                  />
                );
              case "SECURE_USER_RESET_BACKPACK":
                return (
                  <ResetBackpackRequest
                    currentRequest={
                      currentRequest as QueuedUiRequest<"SECURE_USER_RESET_BACKPACK">
                    }
                  />
                );
              case "SECURE_USER_UNLOCK_KEYRING":
                return (
                  <UnlockRequest
                    currentRequest={
                      currentRequest as QueuedUiRequest<"SECURE_USER_UNLOCK_KEYRING">
                    }
                  />
                );
              case "SECURE_USER_GET_MNEMONIC":
                return (
                  <GetMnemonicRequest
                    currentRequest={
                      currentRequest as QueuedUiRequest<"SECURE_USER_GET_MNEMONIC">
                    }
                  />
                );
              case "SECURE_USER_EXPORT_BACKUP":
                return (
                  <ExportBackupRequest
                    currentRequest={
                      currentRequest as QueuedUiRequest<"SECURE_USER_EXPORT_BACKUP">
                    }
                  />
                );
              case "LEDGER_SVM_SIGN_TX":
              case "LEDGER_SVM_SIGN_MESSAGE":
              case "LEDGER_EVM_SIGN_TX":
              case "LEDGER_EVM_SIGN_MESSAGE":
                return (
                  <LedgerSignRequest
                    currentRequest={
                      currentRequest as QueuedUiRequest<LedgerSignEvents>
                    }
                  />
                );
              case "SECURE_USER_PREVIEW_WALLETS":
                return (
                  <HardwarePreviewPublicKeysRequest
                    currentRequest={
                      currentRequest as QueuedUiRequest<"SECURE_USER_PREVIEW_WALLETS">
                    }
                  />
                );
              case "SECURE_SVM_SIGN_MESSAGE":
                return (
                  <SvmSignMessageRequest
                    currentRequest={
                      currentRequest as QueuedUiRequest<"SECURE_SVM_SIGN_MESSAGE">
                    }
                  />
                );
              case "SECURE_SVM_SIGN_IN":
                return (
                  <SvmSignInRequest
                    currentRequest={
                      currentRequest as QueuedUiRequest<"SECURE_SVM_SIGN_IN">
                    }
                  />
                );
              case "SECURE_SVM_SIGN_TX":
                return (
                  <SvmSignTransactionRequest
                    currentRequest={
                      currentRequest as QueuedUiRequest<"SECURE_SVM_SIGN_TX">
                    }
                  />
                );
              case "SECURE_SVM_SIGN_ALL_TX":
                return (
                  <SvmSignAllTransactionsRequest
                    currentRequest={
                      currentRequest as QueuedUiRequest<"SECURE_SVM_SIGN_ALL_TX">
                    }
                  />
                );

              case "SECURE_EVM_SIGN_TX":
                return (
                  <EvmSignTransactionRequest
                    currentRequest={
                      currentRequest as QueuedUiRequest<"SECURE_EVM_SIGN_TX">
                    }
                  />
                );
              case "SECURE_EVM_SIGN_MESSAGE":
                return (
                  <EvmSignMessageRequest
                    currentRequest={
                      currentRequest as QueuedUiRequest<"SECURE_EVM_SIGN_MESSAGE">
                    }
                  />
                );
              default:
                return null;
            }
          })()
        : null}
    </Presentation>
  );
}

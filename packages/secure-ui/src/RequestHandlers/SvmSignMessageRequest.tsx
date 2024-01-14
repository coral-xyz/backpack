import type { QueuedUiRequest } from "../_atoms/requestAtoms";

import { useState } from "react";

import { Blockchain } from "@coral-xyz/common";
import { secureUserAtom } from "@coral-xyz/recoil";
import { decode } from "bs58";
import { useRecoilValue } from "recoil";

import { RequireUserUnlocked } from "../RequireUserUnlocked/RequireUserUnlocked";
import { ApproveMessage } from "../_sharedComponents/ApproveMessage";
import { IsColdWalletWarning } from "../_sharedComponents/IsColdWalletWarning";

export function SvmSignMessageRequest({
  currentRequest,
}: {
  currentRequest: QueuedUiRequest<"SECURE_SVM_SIGN_MESSAGE">;
}) {
  //@ts-ignore
  const msgBuffer = Buffer.from(decode(currentRequest.request.message! ?? ""));
  const message = msgBuffer.toString();
  const user = useRecoilValue(secureUserAtom);
  const [coldWalletWarningIgnored, setColdWalletWarningIgnored] =
    useState(false);

  const publicKeyInfo =
    user.publicKeys.platforms[Blockchain.SOLANA]?.publicKeys[
      currentRequest.request.publicKey
    ];
  if (
    !coldWalletWarningIgnored &&
    publicKeyInfo?.isCold &&
    ["xnft", "browser"].includes(currentRequest.event.origin.context)
  ) {
    return (
      <IsColdWalletWarning
        origin={currentRequest.event.origin.address}
        onDeny={() => currentRequest.error(new Error("Approval Denied"))}
        onIgnore={() => setColdWalletWarningIgnored(true)}
      />
    );
  }

  return (
    <RequireUserUnlocked
      onReset={() => currentRequest.error(new Error("Login Failed"))}
    >
      <ApproveMessage
        currentRequest={currentRequest}
        title="Approve Solana Message"
        message={message}
        blockchain={Blockchain.SOLANA}
      />
    </RequireUserUnlocked>
  );
}

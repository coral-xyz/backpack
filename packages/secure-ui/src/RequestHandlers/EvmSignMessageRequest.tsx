import type { QueuedUiRequest } from "../_atoms/requestAtoms";

import { useState } from "react";

import { Blockchain } from "@coral-xyz/common";
import { secureUserAtom } from "@coral-xyz/recoil";
import { decode } from "bs58";
import { useRecoilValue } from "recoil";

import { ImpersonateMetamaskInfo } from "./ImpersonateMetamaskInfo";
import { RequireUserUnlocked } from "../RequireUserUnlocked/RequireUserUnlocked";
import { ApproveMessage } from "../_sharedComponents/ApproveMessage";
import { IsColdWalletWarning } from "../_sharedComponents/IsColdWalletWarning";

export function EvmSignMessageRequest({
  currentRequest,
}: {
  currentRequest: QueuedUiRequest<"SECURE_EVM_SIGN_MESSAGE">;
}) {
  const msgBuffer = Buffer.from(
    decode(currentRequest.request.message58! ?? "")
  );
  const message = msgBuffer.toString("utf-8");
  const user = useRecoilValue(secureUserAtom);

  const publicKeyInfo =
    user.publicKeys.platforms[Blockchain.ETHEREUM]?.publicKeys[
      currentRequest.request.publicKey
    ];

  const [coldWalletWarningIgnored, setColdWalletWarningIgnored] =
    useState(false);
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

  if (
    !user.preferences.confirmedMetaMaskSetting &&
    ["xnft", "browser"].includes(currentRequest.event.origin.context)
  ) {
    return <ImpersonateMetamaskInfo />;
  }

  return (
    <RequireUserUnlocked
      onReset={() => currentRequest.error(new Error("Login Failed"))}
    >
      <ApproveMessage
        currentRequest={currentRequest}
        title="Approve Ethereum Message"
        message={message}
        blockchain={Blockchain.ETHEREUM}
      />
    </RequireUserUnlocked>
  );
}

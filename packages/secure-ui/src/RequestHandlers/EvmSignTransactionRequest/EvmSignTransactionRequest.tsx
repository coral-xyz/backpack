import type { QueuedUiRequest } from "../../_atoms/requestAtoms";

import React, { useState } from "react";

import { Blockchain } from "@coral-xyz/common";
import { secureUserAtom } from "@coral-xyz/recoil";
import { useRecoilValue } from "recoil";

import { AnyTransaction } from "./AnyTransaction";
import { SendTokenTransaction } from "./SendTokenTransaction";
import { IsColdWalletWarning } from "../../_sharedComponents/IsColdWalletWarning";
import { ImpersonateMetamaskInfo } from "../ImpersonateMetamaskInfo";

export function EvmSignTransactionRequest({
  currentRequest,
}: {
  currentRequest: QueuedUiRequest<"SECURE_EVM_SIGN_TX">;
}) {
  const uiOptions = currentRequest.uiOptions;
  const user = useRecoilValue(secureUserAtom);
  const senderPublicKeyInfo =
    user.publicKeys.platforms[Blockchain.ETHEREUM]?.publicKeys[
      currentRequest.request.publicKey
    ];

  const [coldWalletWarningIgnored, setColdWalletWarningIgnored] =
    useState(false);
  if (
    !coldWalletWarningIgnored &&
    senderPublicKeyInfo?.isCold &&
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

  switch (uiOptions.type) {
    // case "SEND_NFT":
    // case "SEND_TOKEN": {
    //   return (
    //     <SendTokenTransaction
    //       currentRequest={currentRequest}
    //       uiOptions={uiOptions}
    //     />
    //   );
    // }
    case "ANY":
    default: {
      return (
        <AnyTransaction
          currentRequest={currentRequest}
          uiOptions={{ type: "ANY" }}
        />
      );
    }
  }
}

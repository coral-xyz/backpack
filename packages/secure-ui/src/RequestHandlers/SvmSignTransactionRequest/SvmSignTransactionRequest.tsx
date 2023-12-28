import type { QueuedUiRequest } from "../../_atoms/requestAtoms";

import { useState } from "react";

import { Blockchain } from "@coral-xyz/common";
import { secureUserAtom } from "@coral-xyz/recoil";
import { useRecoilValue } from "recoil";

import { AnyTransaction } from "./AnyTransaction";
import { IsColdWalletWarning } from "../../_sharedComponents/IsColdWalletWarning";

export function SvmSignTransactionRequest({
  currentRequest,
}: {
  currentRequest: QueuedUiRequest<"SECURE_SVM_SIGN_TX">;
}) {
  const uiOptions = currentRequest.uiOptions;
  const user = useRecoilValue(secureUserAtom);

  const senderPublicKeyInfo =
    user.publicKeys.platforms[Blockchain.SOLANA]?.publicKeys[
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
    // case "BURN_NFT": {
    //   return (
    //     <BurnTokenTransaction
    //       currentRequest={currentRequest}
    //       uiOptions={uiOptions}
    //     />
    //   );
    // }
    // case "UNINSTALL_XNFT": {
    //   return (
    //     <UninstallXnftTransaction
    //       currentRequest={currentRequest}
    //       uiOptions={TypedObject(uiOptions, "UNINSTALL_XNFT")}
    //     />
    //   );
    // }
    // case "SWAP_TOKENS": {
    //   return (
    //     <SwapTokenTransaction
    //       currentRequest={currentRequest}
    //       uiOptions={uiOptions}
    //     />
    //   );
    // }
    case "ANY":
    default: {
      return <AnyTransaction currentRequest={currentRequest} />;
    }
  }
}

import {
  PrimaryButton,
  ProxyImage,
  SecondaryButton,
  Stack,
  StyledText,
  TextArea,
  TwoButtonFooter,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";
import { decode } from "bs58";
import { useRecoilValue } from "recoil";

import type { QueuedRequest } from "../_atoms/clientAtoms";
import { userAtom } from "../_atoms/userAtom";
import { ApproveTransactionBottomSheet } from "../_sharedComponents/ApproveTransactionBottomSheet";
import { RequireUserUnlocked } from "../Guards/RequireUserUnlocked";
import { Presentation } from "../Presentation";

export function SignTransactionRequest({
  currentRequest,
}: {
  currentRequest: QueuedRequest<"SECURE_SVM_SIGN_TX">;
}) {
  return (
    <Presentation
      currentRequest={currentRequest}
      onClosed={() => currentRequest.error("Plugin Closed")}
    >
      {(currentRequest) => (
        <RequireUserUnlocked>
          <ApproveTransactionBottomSheet
            id={currentRequest.queueId}
            title="Sign Transaction"
            message={JSON.stringify(currentRequest.request)}
            onApprove={() => currentRequest.respond({ confirmed: true })}
            onDeny={() => currentRequest.error("User Denied Approval")}
          />
        </RequireUserUnlocked>
      )}
    </Presentation>
  );
}

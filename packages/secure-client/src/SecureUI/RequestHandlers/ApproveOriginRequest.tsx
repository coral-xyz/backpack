import type { SecureEvent } from "@coral-xyz/secure-background/types";
import {
  SECURE_EVENTS,
  SecureRequest,
} from "@coral-xyz/secure-background/types";
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

export function ApproveOriginRequest({
  currentRequest,
}: {
  currentRequest: QueuedRequest<"SECURE_USER_APPROVE_ORIGIN">;
}) {
  const message = currentRequest.request.origin;

  return (
    <Presentation
      currentRequest={currentRequest}
      onClosed={() => currentRequest.error("Plugin Closed")}
    >
      {(currentRequest) => (
        <RequireUserUnlocked>
          <ApproveTransactionBottomSheet
            id={currentRequest.queueId}
            title="Approve Origin"
            message={message}
            onApprove={() => currentRequest.respond({ confirmed: true })}
            onDeny={() => currentRequest.error("User Denied Approval")}
          />
        </RequireUserUnlocked>
      )}
    </Presentation>
  );
}

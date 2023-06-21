import { useEffect } from "react";
import type { SECURE_EVENTS } from "@coral-xyz/secure-background/types";

import type { QueuedRequest } from "../_atoms/clientAtoms";
import { RequireUserUnlocked } from "../Guards/RequireUserUnlocked";
import { Presentation } from "../Presentation";

export function UnlockRequest({
  currentRequest,
}: {
  currentRequest: QueuedRequest<"SECURE_USER_UNLOCK_KEYRING">;
}) {
  return (
    <Presentation
      currentRequest={currentRequest}
      onClosed={() => currentRequest.respond({ unlocked: false })}
    >
      {(currentRequest) => (
        <RequireUserUnlocked force>
          <Confirmed
            onRender={() => currentRequest.respond({ unlocked: true })}
          />
        </RequireUserUnlocked>
      )}
    </Presentation>
  );
}

function Confirmed({ onRender }: { onRender: () => void }) {
  useEffect(onRender, [onRender]);
  return null;
}

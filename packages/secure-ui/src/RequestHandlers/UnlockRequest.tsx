import type { QueuedUiRequest } from "../_atoms/requestAtoms";

import { RequireUserUnlocked } from "../RequireUserUnlocked/RequireUserUnlocked";

export function UnlockRequest({
  currentRequest,
}: {
  currentRequest: QueuedUiRequest<"SECURE_USER_UNLOCK_KEYRING">;
}) {
  return (
    <RequireUserUnlocked
      force={currentRequest.uiOptions.force}
      withMotion={false}
      onReset={() => currentRequest.error(new Error("Login Failed"))}
      onSuccess={() => currentRequest.respond({ unlocked: true })}
    />
  );
}

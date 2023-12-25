import type { QueuedUiRequest } from "../_atoms/requestAtoms";

import { Loading } from "../_sharedComponents/Loading";

export function UnlockRequest({
  currentRequest,
}: {
  currentRequest: QueuedUiRequest<"SECURE_USER_UNLOCK_KEYRING">;
}) {
  // unlock attempt and response is happening in Presentation.native.tsx.
  return <Loading />;
}

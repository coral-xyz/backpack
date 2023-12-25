import { BanIcon } from "@coral-xyz/tamagui";

import { BlockingWarning } from "./BlowfishEvaluation";
import { ErrorMessage } from "./ErrorMessage";

export function IsColdWalletWarning({
  origin,
  onIgnore,
  onDeny,
}: {
  onIgnore: () => void;
  onDeny: () => void;
  origin: string;
}) {
  return (
    <BlockingWarning
      warning={{
        severity: "WARNING",
        kind: "warning",
        message: `WARNING: ${origin} is trying to sign with your cold wallet. This may be dangerous. To disable this warning, see your wallet settings and enable "App Signing". Proceed with caution!`,
      }}
      onIgnore={onIgnore}
      onDeny={onDeny}
    />
  );
}

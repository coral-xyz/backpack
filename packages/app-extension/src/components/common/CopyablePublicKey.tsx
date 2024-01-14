import { useState } from "react";
import { formatWalletAddress } from "@coral-xyz/common";
import { useTheme } from "@coral-xyz/tamagui";

import { TokenBadge } from "../Unlocked/Balances/TokensWidget/TokenBadge";

import { WithCopyTooltip } from "./WithCopyTooltip";

/**
 * A shortened version of a public key inside a themed grey box, it shows
 * the full key on hover and copies it to the clipboard on click.
 */
export const CopyablePublicKey = ({
  publicKey,
  ...optionalProps
}: {
  publicKey: Parameters<typeof formatWalletAddress>[0];
} & Partial<React.ComponentPropsWithoutRef<typeof TokenBadge>>) => {
  const theme = useTheme();

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const publicKeyString = publicKey.toString();
  return (
    <WithCopyTooltip tooltipOpen={tooltipOpen}>
      <div title={publicKeyString} aria-label={publicKeyString}>
        <TokenBadge
          fontSize={13}
          overwriteBackground={theme.baseBackgroundL1.val}
          onClick={async () => {
            setTooltipOpen(true);
            setTimeout(() => setTooltipOpen(false), 1000);
            await navigator.clipboard.writeText(publicKeyString);
          }}
          label={formatWalletAddress(publicKey)}
          {...optionalProps}
        />
      </div>
    </WithCopyTooltip>
  );
};

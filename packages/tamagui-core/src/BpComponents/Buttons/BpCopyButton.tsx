import React, { useState } from "react";

import { Copy as CopyIcon } from "@tamagui/lucide-icons";
import { Tooltip, YStack } from "tamagui";

import { BpSecondaryButton } from "./BpStandardButtons";
import { StyledText } from "../../";

export const BpCopyButton = React.forwardRef(_BpCopyButton);

function _BpCopyButton(
  {
    text,
    tooltipText = "Copied",
    label,
    ...buttonProps
  }: {
    text: string;
    tooltipText?: string;
    label?: string;
  } & Omit<React.ComponentProps<typeof BpSecondaryButton>, "label">,
  ref
) {
  const originalLabel = label ?? "Copy";
  const [buttonLabel, setButtonLabel] = useState(originalLabel);
  const onCopy = async () => {
    setButtonLabel(tooltipText);
    setTimeout(() => setButtonLabel(originalLabel), 1000);
    await navigator.clipboard.writeText(text);
  };

  return (
    <BpSecondaryButton
      ref={ref}
      onPress={onCopy}
      iconAfter={<CopyIcon color="$buttonSecondaryText" size="$1" />}
      label={buttonLabel}
      {...buttonProps}
    />
  );
}

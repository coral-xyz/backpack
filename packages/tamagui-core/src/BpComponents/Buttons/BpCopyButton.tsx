import { Copy as CopyIcon } from "@tamagui/lucide-icons";
import { type ComponentProps, forwardRef, useState } from "react";

import { BpSecondaryButton } from "./BpStandardButtons";

export const BpCopyButton = forwardRef(_BpCopyButton);

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
  } & Omit<ComponentProps<typeof BpSecondaryButton>, "label">,
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

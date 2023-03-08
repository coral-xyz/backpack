import type { GetProps } from "tamagui";
import { Button, styled } from "tamagui";

export const BaseButton = styled(Button, {
  theme: "dark",
  name: "BaseButton",
  borderRadius: 12,
  paddingHorizontal: 12,
  height: 48,
  userSelect: "none",
  backgroundColor: "$primaryButton",
  color: "$primaryButtonTextColor",
  fontWeight: "500",
  fontSize: 16,
});

export type BaseButtonProps = GetProps<typeof BaseButton>;

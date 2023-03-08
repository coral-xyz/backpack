import type { GetProps } from "tamagui";
import { Stack, styled } from "tamagui";

export const Circle2 = styled(Stack, {
  name: "Circle2",
  borderRadius: 100_000_000,
  backgroundColor: "$background",
  width: 100,
  height: 100,
});

export type Circle2Props = GetProps<typeof Circle2>;

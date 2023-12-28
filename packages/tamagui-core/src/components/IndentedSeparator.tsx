import { XStack, Separator } from "../";

export function IndentedSeparator(): JSX.Element {
  return (
    <XStack bc="$baseBackgroundL1">
      <Separator ml={16} borderColor="$baseDivider" />
    </XStack>
  );
}

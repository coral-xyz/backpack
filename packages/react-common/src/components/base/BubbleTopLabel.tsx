import { legacyMakeStyles as styles } from "@coral-xyz/tamagui";
import { StyledText } from "@coral-xyz/tamagui";

export const BubbleTopLabel = ({ text }: { text: string }) => {
  return (
    <StyledText fontSize={"$xs"} color="$baseTextMedEmphasis" paddingLeft="$1">
      {text}
    </StyledText>
  );
};

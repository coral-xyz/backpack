import { StyledText, type StyledTextProps } from "../StyledText";

export const ListHeaderCore = ({
  style,
  title,
}: {
  style?: Omit<StyledTextProps, "children">;
  title: string;
}) => (
  <StyledText
    fontSize="$base"
    color="$baseTextMedEmphasis"
    marginBottom={8}
    marginLeft={16}
    {...style}
  >
    {title}
  </StyledText>
);

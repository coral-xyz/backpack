import { StyledText } from "@coral-xyz/tamagui";

export function ErrorMessage(props: any) {
  if (props.for) {
    return (
      <StyledText fontWeight="400" size={8} color="$redText">
        {props.for.message}
      </StyledText>
    );
  }

  return null;
}

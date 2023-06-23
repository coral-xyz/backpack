import { StyledText } from "@coral-xyz/tamagui";

export function ErrorMessage(props: any) {
  if (props.for) {
    return (
      <StyledText size="$xs" color="$redText">
        {props.for.message}
      </StyledText>
    );
  }

  return null;
}

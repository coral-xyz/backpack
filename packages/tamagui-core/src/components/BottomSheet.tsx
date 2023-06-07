import { Stack, StyledText } from "../";

type BottomSheetTitleProps = {
  title: string;
};
export function BottomSheetTitle({
  title,
}: BottomSheetTitleProps): JSX.Element {
  return (
    <StyledText fontSize="$lg" textAlign="center" mb={18}>
      {title}
    </StyledText>
  );
}

type BottomSheetContainerProps = {
  children: React.ReactNode;
};
export function BottomSheetContainer({
  children,
}: BottomSheetContainerProps): JSX.Element {
  return <Stack>{children}</Stack>;
}

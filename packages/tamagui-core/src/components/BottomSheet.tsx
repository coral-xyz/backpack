import { Stack, StyledText } from "../";

type BottomSheetTitleProps = {
  title: string;
};
export function BottomSheetTitle({
  title,
  ...props
}: BottomSheetTitleProps): JSX.Element {
  return (
    <StyledText fontSize="$lg" textAlign="center" mb={18} {...props}>
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

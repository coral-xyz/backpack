import { type ReactNode, Suspense } from "react";
import type { FallbackProps } from "react-error-boundary";
import { ErrorBoundary } from "react-error-boundary";
import { Button, StyledText, YStack } from "@coral-xyz/tamagui";

import { Scrollbar } from "../../../components/common/Layout/Scrollbar";

export function ScreenContainer({
  name,
  children,
  loading = null,
  noScrollbar,
}: {
  name?: any;
  children: ReactNode;
  loading?: ReactNode;
  noScrollbar?: boolean;
}) {
  const inner = (
    <ErrorBoundary fallbackRender={(props) => fallbackRender(props, name)}>
      <Suspense fallback={loading}>{children}</Suspense>
    </ErrorBoundary>
  );
  if (noScrollbar) {
    return inner;
  }
  return <Scrollbar>{inner}</Scrollbar>;
}

function fallbackRender(
  { error, resetErrorBoundary }: FallbackProps,
  name: string
) {
  const renderError = (error: any) => {
    if (error?.message) {
      return error.message;
    }

    try {
      return JSON.stringify(error);
    } catch (error: any) {
      return error.message;
    }
  };
  return (
    <YStack
      flex={1}
      backgroundColor="$baseBackgroundL0"
      justifyContent="center"
      alignItems="center"
      space="$4"
    >
      <StyledText>{name}</StyledText>
      <StyledText color="$redText" fontSize="$md">
        {renderError(error)}
      </StyledText>
      <Button onPress={resetErrorBoundary}>Reset</Button>
    </YStack>
  );
}

import { Suspense, ComponentType } from "react";

import { ErrorBoundary, FallbackProps } from "react-error-boundary";

export function ScreenDataContainer({
  children,
  Loading,
  Error,
}: {
  children: React.ReactNode;
  Loading: React.ReactNode;
  Error: ComponentType<FallbackProps>;
}): JSX.Element {
  return (
    <ErrorBoundary FallbackComponent={Error}>
      <Suspense fallback={Loading}>{children}</Suspense>
    </ErrorBoundary>
  );
}

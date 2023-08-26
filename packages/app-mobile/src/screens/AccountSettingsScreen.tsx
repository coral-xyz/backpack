import { Suspense } from "react";

import { ErrorBoundary } from "react-error-boundary";

import { SettingsList } from "~components/AccountSettingsBottomSheet";
import { Screen, ScreenError, ScreenLoading } from "~components/index";

function Container({ navigation }): JSX.Element {
  return (
    <Screen>
      <SettingsList navigation={navigation} />
    </Screen>
  );
}

export function AccountSettingsScreen({ navigation }): JSX.Element {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => <ScreenError error={error} />}
    >
      <Suspense fallback={<ScreenLoading />}>
        <Container navigation={navigation} />
      </Suspense>
    </ErrorBoundary>
  );
}

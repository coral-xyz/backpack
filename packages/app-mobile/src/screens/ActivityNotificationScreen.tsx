import { Suspense } from "react";
import { Text, View } from "react-native";

import { NotificationsData } from "@coral-xyz/recoil";
import { ErrorBoundary } from "react-error-boundary";

import { FullScreenLoading } from "~components/index";

export function ActivityNotificationScreen({ navigation }): JSX.Element {
  return <ScreenWrapper />;
}

function ScreenWrapper() {
  return (
    <ErrorBoundary fallback={<View />}>
      <Suspense fallback={<FullScreenLoading />}>
        <NotificationsData>
          {({ groupedNotifications }: any) => (
            <View style={{ flex: 1, alignItems: "center", paddingTop: 40 }}>
              <Text>Notifications</Text>
              <Text>{JSON.stringify(groupedNotifications)}</Text>
            </View>
          )}
        </NotificationsData>
      </Suspense>
    </ErrorBoundary>
  );
}

import { ApolloProvider, SuspenseCache } from "@apollo/client";
import { NotificationsProvider } from "@coral-xyz/recoil";
import { TamaguiProvider, config } from "@coral-xyz/tamagui";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RecoilRelayEnvironmentProvider } from "recoil-relay";

import { useTheme } from "~hooks/useTheme";

import { apolloClient } from "./graphql";
import RelayEnvironment from "./relay/RelayEnvironment";
import { RelayEnvironmentKey } from "./relay/environment";

const suspenseCache = new SuspenseCache();

export function Providers({
  children,
}: {
  children: JSX.Element;
}): JSX.Element {
  const theme = useTheme();
  return (
    <RecoilRelayEnvironmentProvider
      environment={RelayEnvironment}
      environmentKey={RelayEnvironmentKey}
    >
      <RelayEnvironment>
        <ApolloProvider client={apolloClient} suspenseCache={suspenseCache}>
          <TamaguiProvider config={config} defaultTheme={theme.colorScheme}>
            <SafeAreaProvider>
              <NotificationsProvider>
                <ActionSheetProvider>
                  <BottomSheetModalProvider>
                    {children}
                  </BottomSheetModalProvider>
                </ActionSheetProvider>
              </NotificationsProvider>
            </SafeAreaProvider>
          </TamaguiProvider>
        </ApolloProvider>
      </RelayEnvironment>
    </RecoilRelayEnvironmentProvider>
  );
}

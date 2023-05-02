import { ApolloProvider, SuspenseCache } from "@apollo/client";
import { NotificationsProvider } from "@coral-xyz/recoil";
import { TamaguiProvider, config } from "@coral-xyz/tamagui";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useTheme } from "~hooks/useTheme";

import RelayEnvironment from "./graphql/RelayEnvironment";
import { useApolloClient } from "./graphql/apollo";

const suspenseCache = new SuspenseCache();

export function Providers({
  children,
}: {
  children: JSX.Element;
}): JSX.Element | null {
  const theme = useTheme();
  const { client } = useApolloClient();

  // TODO(peter)
  if (!client) {
    return null;
  }

  return (
    <RelayEnvironment>
      <ApolloProvider client={client} suspenseCache={suspenseCache}>
        <TamaguiProvider config={config} defaultTheme={theme.colorScheme}>
          <SafeAreaProvider>
            <NotificationsProvider>
              <ActionSheetProvider>
                <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
              </ActionSheetProvider>
            </NotificationsProvider>
          </SafeAreaProvider>
        </TamaguiProvider>
      </ApolloProvider>
    </RelayEnvironment>
  );
}

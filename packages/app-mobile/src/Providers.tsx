import { ApolloProvider, SuspenseCache } from "@apollo/client";
import { NotificationsProvider } from "@coral-xyz/recoil";
import { TamaguiProvider, config } from "@coral-xyz/tamagui";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useTheme } from "~hooks/useTheme";
import { SessionProvider } from "~lib/SessionProvider";

import RelayEnvironment from "./graphql/RelayEnvironment";
import { useApolloClient } from "./graphql/apollo";

import { BiometricContextProvider } from "~src/features/biometrics/context";

const suspenseCache = new SuspenseCache();

function InnerProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const theme = useTheme();
  const { client } = useApolloClient();

  // TODO(peter)
  if (!client) {
    return null;
  }

  return (
    <ApolloProvider client={client} suspenseCache={suspenseCache}>
      <TamaguiProvider config={config} defaultTheme={theme.colorScheme}>
        <SafeAreaProvider>
          <NotificationsProvider>
            <ActionSheetProvider>
              <BiometricContextProvider>
                <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
              </BiometricContextProvider>
            </ActionSheetProvider>
          </NotificationsProvider>
        </SafeAreaProvider>
      </TamaguiProvider>
    </ApolloProvider>
  );
}

export function Providers({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <SessionProvider>
      <RelayEnvironment>
        <InnerProvider>{children}</InnerProvider>
      </RelayEnvironment>
    </SessionProvider>
  );
}

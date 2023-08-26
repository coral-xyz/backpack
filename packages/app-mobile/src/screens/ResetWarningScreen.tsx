import { useState } from "react";
import { View } from "react-native";

import {
  formatWalletAddress,
  UI_RPC_METHOD_KEYRING_KEY_DELETE,
  UI_RPC_METHOD_USER_ACCOUNT_PUBLIC_KEY_DELETE,
  UI_RPC_METHOD_USER_ACCOUNT_LOGOUT,
} from "@coral-xyz/common";
import { useBackgroundClient, useUser } from "@coral-xyz/recoil";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  DangerButton,
  EmptyState,
  FullScreenLoading,
  Screen,
  SecondaryButton,
  TwoButtonFooter,
} from "~components/index";

import { WarningHeader } from "~src/features/warning";
import { useSession } from "~src/lib/SessionProvider";

export function LogoutWarningScreen(): JSX.Element {
  const background = useBackgroundClient();
  const user = useUser();

  return (
    <Warning
      buttonTitle="Logout"
      title="Logout"
      subtext="This will remove all the wallets you have created or imported. Make sure you have your existing secret recovery phrase and private keys saved."
      onNext={async () => {
        await background.request({
          method: UI_RPC_METHOD_USER_ACCOUNT_LOGOUT,
          params: [user.uuid],
        });
      }}
    />
  );
}

export function ResetWarningScreen(): JSX.Element {
  const { reset } = useSession();

  return (
    <Warning
      buttonTitle="Reset"
      title="Reset Backpack"
      subtext="This will remove all the user accounts you have created or imported. Make sure you have your existing secret recovery phrase and private keys saved."
      onNext={reset}
    />
  );
}

export function RemoveWalletScreen({ route, navigation }): JSX.Element {
  const background = useBackgroundClient();
  const { blockchain, publicKey, type } = route.params;
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(false);

  const onRemove = async () => {
    setShowSuccess(false);
    setError(false);
    setLoading(true);
    try {
      if (type === "dehydrated") {
        await background.request({
          method: UI_RPC_METHOD_USER_ACCOUNT_PUBLIC_KEY_DELETE,
          params: [blockchain, publicKey],
        });
      } else {
        await background.request({
          method: UI_RPC_METHOD_KEYRING_KEY_DELETE,
          params: [blockchain, publicKey],
        });
      }
      setLoading(false);
      setShowSuccess(true);
    } catch (error) {
      console.error(error);
      setLoading(false);
      setError(true);
    }
  };

  if (loading) {
    return <FullScreenLoading label="Removing wallet..." />;
  }

  if (showSuccess) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <EmptyState
          icon={(props: any) => <MaterialIcons name="check" {...props} />}
          title="All done"
          subtitle="Your wallet has been removed from Backpack."
          buttonText="Go back"
          onPress={() => {
            navigation.goBack();
          }}
        />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <EmptyState
          icon={(props: any) => <MaterialIcons name="warning" {...props} />}
          title="Something went wrong"
          subtitle="We weren't able to remove your wallet"
          buttonText="Go back and try again"
          onPress={() => {
            navigation.goBack();
          }}
        />
      </View>
    );
  }

  const title = `Are you sure you want to remove ${formatWalletAddress(
    publicKey
  )}?`;

  const subtitle =
    type === "derived"
      ? "Removing from Backpack will not delete the wallet’s contents. It will still be available by importing your secret recovery phrase in a new Backpack."
      : type === "ledger"
      ? "Removing from Backpack will not delete the wallet’s contents. It will still be available by connecting your ledger."
      : type === "dehydrated"
      ? "Removing from Backpack will remove the connection between your username and this public key. You can always add it back later by adding the wallet to Backpack."
      : "Removing from Backpack will delete the wallet’s keypair. Make sure you have exported and saved the private key before removing.";

  return (
    <Warning
      buttonTitle="Remove"
      title={title}
      subtext={subtitle}
      onNext={onRemove}
    />
  );
}

function Warning({
  title,
  buttonTitle,
  subtext,
  onNext,
}: {
  title: string;
  buttonTitle: string;
  subtext: string;
  onNext: () => void;
}): JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const onPressCancel = () => {
    navigation.goBack();
  };

  return (
    <Screen jc="space-between" style={{ marginBottom: insets.bottom }}>
      <WarningHeader title={title} subtitle={subtext} />
      <TwoButtonFooter
        leftButton={<SecondaryButton label="Cancel" onPress={onPressCancel} />}
        rightButton={<DangerButton label={buttonTitle} onPress={onNext} />}
      />
    </Screen>
  );
}

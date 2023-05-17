import { View, Image } from "react-native";

import { Blockchain, walletAddressDisplay } from "@coral-xyz/common";
import { getBlockchainLogo, useActiveWallets } from "@coral-xyz/recoil";
import { StyledText, XStack } from "@coral-xyz/tamagui";

import { Avatar, Screen } from "~components/index";

function AvatarHeader(): JSX.Element {
  return (
    <View style={{ alignItems: "center", marginBottom: 24 }}>
      <Avatar size={140} />
    </View>
  );
}

function NetworkIcon({
  size,
  blockchain,
}: {
  size?: number;
  blockchain: Blockchain;
}) {
  const logo = getBlockchainLogo(blockchain);
  return <Image style={[{ width: size, height: size }]} source={logo} />;
}

function ActiveWallet({
  blockchain,
  publicKey,
}: {
  blockchain: Blockchain;
  publicKey: string;
}): JSX.Element {
  return (
    <XStack backgroundColor="yellow" borderRadius={8} padding={8}>
      <NetworkIcon blockchain={blockchain} size={12} />
      <StyledText fontSize="$base">
        {walletAddressDisplay(publicKey)}
      </StyledText>
    </XStack>
  );
}

function ActiveWalletList() {
  const activeWallets = useActiveWallets();

  return (
    <XStack alignSelf="center" space>
      {activeWallets.map((wallet) => (
        <ActiveWallet
          key={wallet.publicKey}
          blockchain={wallet.blockchain}
          publicKey={wallet.publicKey}
        />
      ))}
    </XStack>
  );
}

function Container(): JSX.Element {
  return (
    <Screen>
      <AvatarHeader />
      <ActiveWalletList />
    </Screen>
  );
}

export function ProfileScreen(): JSX.Element {
  return <Container />;
}

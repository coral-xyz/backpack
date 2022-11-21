import { useState } from "react";
import { Blockchain } from "@coral-xyz/common";
import { Screen } from "@components";
import { StyleSheet, FlatList, Text, View, Image } from "react-native";
import { useActiveWallets } from "@coral-xyz/recoil";
import { useTheme, useBlockchainLogo } from "@hooks";

// TODO(peter) copy from app-extension
function walletAddressDisplay(publicKey: string) {
  return publicKey;
}

export default function DepositModal({ navigation }) {
  const activeWallets = useActiveWallets();
  const onClose = () => navigation.goBack();

  console.log({ activeWallets });

  return (
    <Screen>
      <FlatList
        style={{ flex: 1 }}
        data={activeWallets}
        keyExtractor={(item) => item.publicKey}
        renderItem={({ item }) => {
          return (
            <BlockchainDepositCard
              blockchain={item.blockchain}
              name={item.name}
              publicKey={item.publicKey}
            />
          );
        }}
      />
    </Screen>
  );
}

function BlockchainDepositCard({
  blockchain,
  name,
  publicKey,
}: {
  blockchain: Blockchain;
  name: string;
  publicKey: string;
}) {
  const theme = useTheme();

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipOpenModal, setTooltipOpenModal] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

  const blockchainLogo = useBlockchainLogo(blockchain);
  const blockchainDisplay =
    blockchain.slice(0, 1).toUpperCase() + blockchain.slice(1);

  const onQrCode = () => {
    setShowQrCode(true);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.custom.colors.nav,
          borderColor: theme.custom.colors.borderFull,
          borderRadius: 8,
        },
      ]}
    >
      <Text style={{ fontWeight: "500", color: theme.custom.colors.fontColor }}>
        Your {blockchainDisplay} address
      </Text>
      <Image
        source={blockchainLogo}
        style={{ width: 14, borderRadius: 2, aspectRatio: 1 }}
      />
      <Text
        style={{
          fontWeight: "500",
          fontSize: 14,
          marginTop: 6,
          marginBottom: 6,
          color: theme.custom.colors.secondary,
        }}
      >
        {`${name} (${walletAddressDisplay(publicKey)})`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
  },
});

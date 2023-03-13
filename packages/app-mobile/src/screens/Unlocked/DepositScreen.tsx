import { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import * as Clipboard from "expo-clipboard";

import { Blockchain, walletAddressDisplay } from "@coral-xyz/common";
import { useActiveWallets } from "@coral-xyz/recoil";
import { MaterialIcons } from "@expo/vector-icons";
import QRCode from "react-qr-code";

import {
  CopyWalletFieldInput,
  ListRowSeparator,
  Margin,
  Screen,
} from "~components/index";

import { getBlockchainLogo, useTheme } from "~hooks";

function BlockchainDisclaimerText({
  blockchain,
}: {
  blockchain: Blockchain;
}): JSX.Element {
  const theme = useTheme();
  return (
    <Text
      style={[
        blockchainDisclaimerTextStyles.text,
        { color: theme.custom.colors.secondary },
      ]}
    >
      {blockchain === Blockchain.SOLANA ? (
        <>This address can only receive SOL and SPL tokens on Solana.</>
      ) : null}
      {blockchain === Blockchain.ETHEREUM ? (
        <>This address can only receive ETH and ERC20 tokens on Ethereum.</>
      ) : null}
    </Text>
  );
}

const blockchainDisclaimerTextStyles = StyleSheet.create({
  text: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
});

export function DepositSingleScreen({ route, navigation }): JSX.Element | null {
  const theme = useTheme();
  const { blockchain } = route.params;

  const activeWallets = useActiveWallets();
  const activeWallet = activeWallets.find((w) => w.blockchain === blockchain);

  if (!activeWallet) {
    return null;
  }

  return (
    <Screen style={{ alignItems: "center", justifyContent: "space-around" }}>
      <QRCode value={activeWallet.publicKey} size={200} />
      <View style={{ alignItems: "center" }}>
        <Text
          style={{
            fontSize: 16,
            textAlign: "center",
            marginBottom: 8,
            color: theme.custom.colors.fontColor,
          }}
        >
          {activeWallet.name}
        </Text>
        <Margin top={8} bottom={16}>
          <CopyWalletFieldInput publicKey={activeWallet.publicKey} />
        </Margin>
        <BlockchainDisclaimerText blockchain={blockchain} />
      </View>
    </Screen>
  );
}

export function DepositListScreen({ navigation, route }): JSX.Element {
  const activeWallets = useActiveWallets();
  return (
    <Screen>
      <FlatList
        style={{ flex: 1 }}
        data={activeWallets}
        keyExtractor={(item) => item.publicKey}
        ItemSeparatorComponent={ListRowSeparator}
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

function CircleButton({
  icon,
  onPress,
}: {
  icon: string;
  onPress: () => void;
}): JSX.Element {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: 50,
        height: 50,
        borderRadius: 80,
        backgroundColor: theme.custom.colors.bg2,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <MaterialIcons
        name={icon}
        size={20}
        color={theme.custom.colors.fontColor}
      />
    </Pressable>
  );
}

function QRCodeModal({
  onRequestClose,
  name,
  blockchainLogo,
  blockchainDisplay,
  publicKey,
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        maxHeight: "60%",
        marginHorizontal: 24,
        backgroundColor: theme.custom.colors.background,
        borderRadius: 12,
        padding: 24,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
      }}
    >
      <Pressable
        style={{
          width: 50,
          height: 50,
          position: "absolute",
          top: 12,
          left: 12,
        }}
        onPress={() => {
          // TODO(peter) figure out why i can't close
          console.log("hi");
          onRequestClose();
        }}
      >
        <MaterialIcons
          name="close"
          color={theme.custom.colors.fontColor}
          size={24}
        />
      </Pressable>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Margin right={8}>
          <Image
            source={blockchainLogo}
            style={{ width: 20, height: 20, borderRadius: 40 }}
          />
        </Margin>
        <Text
          style={{
            fontSize: 22,
            color: theme.custom.colors.fontColor,
          }}
        >
          {blockchainDisplay}
        </Text>
      </View>
      <Margin vertical={24}>
        <QRCode value={publicKey} size={200} />
      </Margin>
      <Text
        style={{
          textAlign: "center",
          color: theme.custom.colors.fontColor,
          fontSize: 16,
        }}
      >
        {name}
      </Text>
      <Text
        style={{
          textAlign: "center",
          color: theme.custom.colors.secondary,
        }}
      >
        ({walletAddressDisplay(publicKey)})
      </Text>
    </View>
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
  const [showQrCode, setShowQrCode] = useState(false);

  const blockchainLogo = getBlockchainLogo(blockchain);
  const blockchainDisplay =
    blockchain.slice(0, 1).toUpperCase() + blockchain.slice(1);

  const onPressQrCode = () => {
    setShowQrCode(true);
  };

  const onPressCopy = async () => {
    await Clipboard.setStringAsync(publicKey);
    Alert.alert("Copied to clipboard", publicKey);
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
      <View>
        <Text
          style={{ fontWeight: "500", color: theme.custom.colors.fontColor }}
        >
          Your {blockchainDisplay} address
        </Text>
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
        <Image
          source={blockchainLogo}
          style={{ width: 14, borderRadius: 2, aspectRatio: 1 }}
        />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Margin right={8}>
          <CircleButton icon="qr-code" onPress={onPressQrCode} />
        </Margin>
        <CircleButton icon="content-copy" onPress={onPressCopy} />
      </View>
      <Modal
        animationType="fade"
        transparent
        visible={showQrCode}
        onRequestClose={() => {
          setShowQrCode(false);
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            justifyContent: "center",
          }}
        >
          <QRCodeModal
            blockchainLogo={blockchainLogo}
            blockchainDisplay={blockchainDisplay}
            name={name}
            publicKey={publicKey}
            onRequestClose={() => setShowQrCode(false)}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
});

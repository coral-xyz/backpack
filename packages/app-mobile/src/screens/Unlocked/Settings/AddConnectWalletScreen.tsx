import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import {
  ActionCard,
  Header,
  Margin,
  Screen,
  SubtextParagraph,
} from "@components";
import type { Blockchain } from "@coral-xyz/common";
import {
  openConnectHardware,
  TAB_APPS,
  TAB_BALANCES,
  UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
  UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
  UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
  UI_RPC_METHOD_NAVIGATION_TO_ROOT,
} from "@coral-xyz/common";
import {
  useBackgroundClient,
  useKeyringType,
  useTab,
  useWalletName,
} from "@coral-xyz/recoil";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@hooks";
import { useNavigation } from "@react-navigation/native";

export function AddConnectWalletScreen({
  blockchain,
}: {
  blockchain: Blockchain;
}) {
  const navigation = useNavigation();
  const background = useBackgroundClient();
  const keyringType = useKeyringType();
  const theme = useTheme();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [newPublicKey, setNewPublicKey] = useState("");

  return (
    <Screen>
      <Margin vertical={24}>
        <Header text="Add or connect a wallet" />
        <SubtextParagraph>Add new wallets to Backpack</SubtextParagraph>
      </Margin>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {keyringType === "mnemonic" && (
          <View style={{ flex: 1, marginRight: 12 }}>
            <ActionCard
              icon={
                <MaterialIcons
                  size={24}
                  name="add-circle"
                  color={theme.custom.colors.icon}
                />
              }
              text="Create a new wallet"
              onPress={async () => {
                const newPubkey = await background.request({
                  method: UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
                  params: [blockchain],
                });

                await background.request({
                  method: UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
                  params: [newPubkey, blockchain],
                });

                setNewPublicKey(newPubkey);
                setOpenDrawer(true);
              }}
            />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <ActionCard
            icon={
              <MaterialIcons
                size={24}
                name="arrow-circle-down"
                color={theme.custom.colors.icon}
              />
            }
            text="Import a private key"
            onPress={() => navigation.push("ImportSecretKey", { blockchain })}
          />
        </View>
      </View>
      <View style={{ flex: 0.5, width: "48%", marginTop: 12 }}>
        <ActionCard
          icon={
            <MaterialIcons
              size={24}
              name="account-balance-wallet"
              color={theme.custom.colors.icon}
            />
          }
          text="Import from hardware wallet"
          onPress={() => {
            openConnectHardware(blockchain);
            window.close();
          }}
        />
      </View>
    </Screen>
  );
}

// <ConfirmCreateWallet
//   blockchain={blockchain}
//   publicKey={newPublicKey}
//   setOpenDrawer={setOpenDrawer}
// />

export const ConfirmCreateWallet: React.FC<{
  blockchain: Blockchain;
  publicKey: string;
  setOpenDrawer: (b: boolean) => void;
}> = ({ blockchain, publicKey, setOpenDrawer }) => {
  const theme = useTheme();
  const walletName = useWalletName(publicKey);
  const background = useBackgroundClient();
  // const tab = useTab();

  return (
    <View
      style={{
        backgroundColor: theme.custom.colors.bg2,
        padding: 16,
        justifyContent: "space-between",
      }}
    >
      <View>
        <Text
          style={{
            marginTop: 16,
            textAlign: "center",
            fontWeight: "500",
            fontSize: 18,
            lineHeight: 24,
            color: theme.custom.colors.fontColor,
          }}
        >
          Wallet Created
        </Text>
        <MaterialIcons name="check" size={24} />
      </View>
      <View>
        <Pressable
          onPress={() => {
            if (tab === TAB_BALANCES) {
              // Experience won't go back to TAB_BALANCES so we poke it
              background.request({
                method: UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
                params: [TAB_APPS],
              });
            }

            background.request({
              method: UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
              params: [TAB_BALANCES],
            });

            // Close mini drawer.
            setOpenDrawer(false);
            // Close main drawer.
            close();
          }}
        >
          <Text>
            {JSON.stringify({ blockchain, walletName, publicKey }, null, 2)}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

// <WalletListItem
//   blockchain={blockchain}
//   name={walletName}
//   publicKey={publicKey}
//   showDetailMenu={false}
//   isFirst={true}
//   isLast={true}
// />

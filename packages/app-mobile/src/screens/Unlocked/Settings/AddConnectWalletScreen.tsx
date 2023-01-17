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
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useTheme } from "@hooks";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Pressable, Text, View } from "react-native";

export function AddConnectWalletScreen({ route }) {
  const { blockchain } = route.params;
  const navigation = useNavigation();
  const background = useBackgroundClient();
  const keyringType = useKeyringType();
  const theme = useTheme();
  const [newPublicKey, setNewPublicKey] = useState(null);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["25%"], []);

  const handleOpenModal = () => bottomSheetModalRef.current?.present();
  const handleDismissModal = () => bottomSheetModalRef.current?.dismiss();

  return (
    <Screen>
      <Margin bottom={24}>
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
                handleOpenModal();
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
            onPress={() =>
              navigation.push("import-private-key", { blockchain })
            }
          />
        </View>
      </View>
      <View style={{ flex: 0.5, width: "48%", marginTop: 12 }}>
        <ActionCard
          disabled
          icon={
            <MaterialIcons
              size={24}
              name="account-balance-wallet"
              color={theme.custom.colors.icon}
            />
          }
          text="Import from hardware wallet"
          onPress={() => {
            // openConnectHardware(blockchain);
          }}
        />
      </View>
      <BottomSheetModal
        index={0}
        snapPoints={snapPoints}
        ref={bottomSheetModalRef}
      >
        {newPublicKey ? (
          <ConfirmCreateWallet
            blockchain={blockchain}
            publicKey={newPublicKey}
            onDismiss={handleDismissModal}
          />
        ) : null}
        {newPublicKey ? <Text>{JSON.stringify({ newPublicKey })}</Text> : null}
      </BottomSheetModal>
    </Screen>
  );
}

export const ConfirmCreateWallet: React.FC<{
  blockchain: Blockchain;
  publicKey: string;
  onDismiss: () => void;
}> = ({ blockchain, publicKey, onDismiss }) => {
  const theme = useTheme();
  const walletName = useWalletName(publicKey);
  // const background = useBackgroundClient();

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
            onDismiss();
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

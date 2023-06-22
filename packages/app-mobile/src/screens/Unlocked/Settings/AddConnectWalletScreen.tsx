import type { Blockchain } from "@coral-xyz/common";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";

import { useCallback, useMemo, useRef, useState } from "react";
import { Text, View } from "react-native";

import { UI_RPC_METHOD_KEYRING_DERIVE_WALLET } from "@coral-xyz/common";
import {
  useActiveWallet,
  useBackgroundClient,
  useKeyringHasMnemonic,
  useWalletName,
} from "@coral-xyz/recoil";
import { MaterialIcons } from "@expo/vector-icons";
import { BottomSheetModal, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";

import { CheckIcon } from "~components/Icon";
import {
  ActionCard,
  Header,
  Margin,
  Screen,
  SubtextParagraph,
  RoundedContainerGroup,
} from "~components/index";
import { useTheme } from "~hooks/useTheme";
import { WalletListItem } from "~screens/Unlocked/EditWalletsScreen";

import { useSession } from "~src/lib/SessionProvider";

export function AddConnectWalletScreen() {
  const { setActiveWallet } = useSession();
  const { blockchain } = useActiveWallet();
  const navigation = useNavigation();
  const background = useBackgroundClient();
  const hasMnemonic = useKeyringHasMnemonic();
  const theme = useTheme();
  const [newPublicKey, setNewPublicKey] = useState(null);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["25%"], []);
  const modalHeight = 240;

  const handleOpenModal = () => bottomSheetModalRef.current?.present();
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        pressBehavior="close"
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    []
  );

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
        {hasMnemonic ? (
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

                await setActiveWallet({ blockchain, publicKey: newPubkey });

                setNewPublicKey(newPubkey);
                handleOpenModal();
              }}
            />
          </View>
        ) : null}
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
        backdropComponent={renderBackdrop}
        contentHeight={modalHeight}
        handleStyle={{
          marginBottom: 12,
        }}
        backgroundStyle={{
          backgroundColor: theme.custom.colors.background,
        }}
      >
        <ConfirmCreateWallet blockchain={blockchain} publicKey={newPublicKey} />
      </BottomSheetModal>
    </Screen>
  );
}

export const ConfirmCreateWallet = ({
  blockchain,
  publicKey,
}: {
  blockchain: Blockchain;
  publicKey: string;
}): JSX.Element => {
  const theme = useTheme();
  const walletName = useWalletName(publicKey);

  return (
    <View
      style={{
        marginHorizontal: 16,
        backgroundColor: theme.custom.colors.bg2,
      }}
    >
      <View>
        <Text
          style={{
            textAlign: "center",
            fontWeight: "500",
            fontSize: 18,
            color: theme.custom.colors.fontColor,
          }}
        >
          Wallet Created
        </Text>
        <View style={{ alignSelf: "center", marginVertical: 24 }}>
          <CheckIcon />
        </View>
      </View>
      <RoundedContainerGroup>
        <WalletListItem
          blockchain={blockchain}
          publicKey={publicKey}
          name={walletName}
        />
      </RoundedContainerGroup>
    </View>
  );
};

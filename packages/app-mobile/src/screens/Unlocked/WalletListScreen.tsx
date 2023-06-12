import type { PublicKey, Wallet } from "~types/types";

import { useCallback } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { Blockchain, formatWalletAddress } from "@coral-xyz/common";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HardwareIcon, ImportedIcon, MnemonicIcon } from "~components/Icon";
import { ListItemWalletOverview } from "~components/ListItem";
import {
  BlockchainLogo,
  CopyButtonIcon,
  ListRowSeparator,
  Margin,
  RoundedContainerGroup,
  Row,
  Screen,
  StyledText,
} from "~components/index";
import { useTheme } from "~hooks/useTheme";
import { useWallets } from "~hooks/wallets";

export function WalletListScreen({ navigation, route }): JSX.Element {
  const insets = useSafeAreaInsets();
  const { activeWallet, selectActiveWallet, allWallets } = useWallets();

  const handlePressWallet = useCallback(
    (w: Wallet) => {
      selectActiveWallet(
        { blockchain: w.blockchain, publicKey: w.publicKey },
        () => {
          navigation.goBack();
        }
      );
    },
    [selectActiveWallet, navigation]
  );

  return (
    <Screen style={{ marginBottom: insets.bottom }}>
      <FlatList
        data={allWallets}
        ItemSeparatorComponent={() => <ListRowSeparator />}
        keyExtractor={(item) => item.publicKey.toString()}
        renderItem={({ item: wallet }) => {
          return (
            <WalletListItem
              name={wallet.name}
              publicKey={wallet.publicKey}
              type={wallet.type as string}
              blockchain={wallet.blockchain}
              onPress={handlePressWallet}
              icon={<CopyButtonIcon text={wallet.publicKey} />}
              isSelected={wallet.publicKey === activeWallet?.publicKey}
            />
          );
        }}
      />
    </Screen>
  );
}

function WalletListItem({
  blockchain,
  name,
  publicKey,
  type,
  icon,
  onPress,
  isSelected,
}: {
  blockchain: Blockchain;
  name: string;
  publicKey: string;
  type: string;
  icon?: JSX.Element | null;
  onPress: (wallet: Wallet) => void;
  isSelected: boolean;
}): JSX.Element {
  const theme = useTheme();
  return (
    <RoundedContainerGroup>
      <Pressable
        onPress={() => onPress({ blockchain, name, publicKey, type })}
        style={[
          styles.listItem,
          {
            backgroundColor: theme.custom.colors.nav,
          },
        ]}
      >
        <View style={styles.listItemLeft}>
          <Margin right={12}>
            <BlockchainLogo blockchain={blockchain} />
          </Margin>
          <View>
            <StyledText
              color="$fontColor"
              fontWeight={isSelected ? "$semibold" : "$base"}
            >
              {name}
            </StyledText>
            <Row>
              <WalletTypeIcon
                type={type}
                fill={isSelected ? theme.custom.colors.secondary : undefined}
              />
              <Text
                style={{ fontSize: 14, color: theme.custom.colors.fontColor }}
              >
                {formatWalletAddress(publicKey)}
              </Text>
            </Row>
          </View>
        </View>
        {icon ? icon : null}
      </Pressable>
    </RoundedContainerGroup>
  );
}

function WalletTypeIcon({ type, fill }: { type: string; fill?: string }) {
  switch (type) {
    case "imported":
      return <ImportedIcon fill={fill} />;
    case "hardware":
      return <HardwareIcon fill={fill} />;
    default:
      return <MnemonicIcon fill={fill} />;
  }
}

const styles = StyleSheet.create({
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  listItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
});

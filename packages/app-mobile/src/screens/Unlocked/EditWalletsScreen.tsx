import type { Blockchain } from "@coral-xyz/common";

import { Suspense, useCallback } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";

import {
  toTitleCase,
  UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
  walletAddressDisplay,
} from "@coral-xyz/common";
import {
  useActiveWallet,
  useAllWallets,
  useBackgroundClient,
  useDehydratedWallets,
  usePrimaryWallets,
  useWalletPublicKeys,
} from "@coral-xyz/recoil";
import { StyledText, XStack } from "@coral-xyz/tamagui";
import { ErrorBoundary } from "react-error-boundary";

import { ContentCopyIcon, VerticalDotsIcon } from "~components/Icon";
import {
  AddConnectWalletButton,
  ImportTypeBadge,
  Margin,
  RoundedContainerGroup,
  Screen,
  ScreenError,
  ScreenLoading,
  WalletAddressLabel,
} from "~components/index";
import { getBlockchainLogo } from "~hooks/index";

// function buildSectionList(blockchainKeyrings: any) {
//   return Object.entries(blockchainKeyrings).map(([blockchain, keyring]) => ({
//     blockchain,
//     title: toTitleCase(blockchain),
//     data: [
//       ...keyring.hdPublicKeys.map((k: any) => ({ ...k, type: "derived" })),
//       ...keyring.importedPublicKeys.map((k: any) => ({
//         ...k,
//         type: "imported",
//       })),
//       ...keyring.ledgerPublicKeys.map((k: any) => ({
//         ...k,
//         type: "hardware",
//       })),
//     ],
//   }));
// }

// function SectionHeader({ title }: { title: string }): JSX.Element {
//   const theme = useTheme();
//   return (
//     <Text
//       style={[
//         styles.sectionHeaderTitle,
//         {
//           color: theme.custom.colors.fontColor,
//         },
//       ]}
//     >
//       {title}
//     </Text>
//   );
// }

type Wallet = {
  name: string;
  publicKey: string;
  type: string;
};

// export function WalletListItem({
//   blockchain,
//   name,
//   publicKey,
//   type,
//   icon,
//   onPress,
// }: {
//   blockchain: Blockchain;
//   name: string;
//   publicKey: string;
//   type?: string;
//   icon?: JSX.Element | null;
//   onPress?: (blockchain: Blockchain, wallet: Wallet) => void;
// }): JSX.Element {
//   const theme = useTheme();
//   return (
//     <Pressable
//       onPress={() => {
//         if (onPress && type) {
//           onPress(blockchain, { name, publicKey, type });
//         }
//       }}
//       style={[
//         styles.listItem,
//         {
//           backgroundColor: theme.custom.colors.nav,
//         },
//       ]}
//     >
//       <View style={styles.listItemLeft}>
//         <WalletAddressLabel name={name} publicKey={publicKey} />
//         {type
//           ? (
//             <Margin left={8}>
//               <ImportTypeBadge type={type} />
//             </Margin>
//           )
//           : null}
//       </View>
//       {icon ? icon : null}
//     </Pressable>
//   );
// }
//
// function WalletList({
//   onPressItem,
//   onPressAddWallet,
// }: {
//   onPressItem: (blockchain: Blockchain, wallet: Wallet) => void;
//   onPressAddWallet: (blockchain: Blockchain) => void;
// }): JSX.Element {
//   const blockchainKeyrings = useWalletPublicKeys();
//   const sections = buildSectionList(blockchainKeyrings);
//
//   return (
//     <SectionList
//       sections={sections}
//       keyExtractor={(item, index) => item + index}
//       renderItem={({ section, item: wallet, index }) => {
//         const blockchain = section.blockchain as Blockchain;
//         const isFirst = index === 0;
//         const isLast = index === section.data.length - 1;
//         return (
//           <RoundedContainerGroup
//             disableTopRadius={!isFirst}
//             disableBottomRadius={!isLast}
//           >
//             <WalletListItem
//               name={wallet.name}
//               publicKey={wallet.publicKey}
//               type={wallet.type}
//               blockchain={blockchain}
//               onPress={onPressItem}
//               icon={<IconPushDetail />}
//             />
//           </RoundedContainerGroup>
//         );
//       }}
//       renderSectionHeader={({ section: { title } }) => (
//         <SectionHeader title={title} />
//       )}
//       renderSectionFooter={({ section }) => (
//         <Margin bottom={24} top={8}>
//           <AddConnectWalletButton
//             blockchain={section.blockchain}
//             onPress={onPressAddWallet}
//           />
//         </Margin>
//       )}
//     />
//   );
// }

const CopyPublicKey = ({ publicKey }: { publicKey: string }) => {
  return (
    <Pressable
      onPress={async () => {
        await Clipboard.setStringAsync(publicKey);
        Alert.alert("Copied to clipboard", publicKey);
      }}
    >
      <XStack ai="center" backgroundColor="#eee" padding={4} borderRadius={4}>
        <StyledText fontSize="$sm" mr={4}>
          {walletAddressDisplay(publicKey)}
        </StyledText>
        <ContentCopyIcon size={18} />
      </XStack>
    </Pressable>
  );
};

const WalletListItem = ({
  name,
  publicKey,
  blockchain,
  selected,
  type,
  onPressEdit,
}: any) => {
  const logo = getBlockchainLogo(blockchain);
  return (
    <XStack
      backgroundColor="white"
      ai="center"
      jc="space-between"
      height="$container"
      padding={12}
    >
      <Pressable
        style={{ flexDirection: "row", alignItems: "center" }}
        onPress={() => {
          Alert.alert("pressed", name);
        }}
      >
        <Image
          source={logo}
          style={{
            aspectRatio: 1,
            width: 24,
            height: 24,
            marginRight: 12,
          }}
        />
        <StyledText fontSize="$base" fontWeight={selected ? "$800" : undefined}>
          {name}
        </StyledText>
      </Pressable>
      <XStack ai="center">
        <CopyPublicKey publicKey={publicKey} />
        <Pressable
          onPress={() => onPressEdit(blockchain, { name, publicKey, type })}
        >
          <VerticalDotsIcon />
        </Pressable>
      </XStack>
    </XStack>
  );
};

function WalletList2({ onPressItem }) {
  const background = useBackgroundClient();
  const activeWallet = useActiveWallet();
  const wallets = useAllWallets();
  const activeWallets = wallets.filter((w) => !w.isCold);
  const coldWallets = wallets.filter((w) => w.isCold);

  console.log("debug1:allwallets", wallets, activeWallets, coldWallets);

  // Dehydrated public keys are keys that exist on the server but cannot be
  // used on the client as we don't have signing data, e.g. mnemonic, private
  // key or ledger derivation path
  const dehydratedWallets = useDehydratedWallets().map((w: any) => ({
    ...w,
    name: "", // TODO server side does not sync wallet names
    type: "dehydrated",
  }));

  // activeWallet={activeWallet}
  // activeWallets={activeWallets.concat(dehydratedWallets)}
  // coldWallets={coldWallets}

  const selectedWalletPublicKey = activeWallet.publicKey;
  const data = [...activeWallets, ...dehydratedWallets];

  const handleSelectWallet = useCallback(
    async ({
      blockchain,
      publicKey,
    }: {
      blockchain: Blockchain;
      publicKey: string;
    }) => {
      await background.request({
        method: UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
        params: [publicKey, blockchain],
      });
    },
    [background]
  );

  const renderItem = useCallback(
    ({ item: wallet, index }) => {
      const isSelected =
        false &&
        selectedWalletPublicKey !== undefined &&
        selectedWalletPublicKey === wallet.publicKey.toString();

      const isFirst = index === 0;
      const isLast = index === data.length - 1;

      return (
        <RoundedContainerGroup
          disableTopRadius={!isFirst}
          disableBottomRadius={!isLast}
        >
          <WalletListItem
            name={wallet.name}
            publicKey={wallet.publicKey}
            type={wallet.type}
            blockchain={wallet.blockchain}
            isSelected={isSelected}
            onPressEdit={onPressItem}
            onSelectWallet={handleSelectWallet}
          />
        </RoundedContainerGroup>
      );
    },
    [selectedWalletPublicKey, onPressItem, data.length]
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.publicKey}
    />
  );
}

function Container({ navigation }): JSX.Element {
  const handlePressItem = (
    blockchain: Blockchain,
    { name, publicKey, type }: Wallet
  ) => {
    navigation.navigate("edit-wallets-wallet-detail", {
      blockchain,
      publicKey,
      name,
      type,
    });
  };

  const handlePressAddWallet = (blockchain: Blockchain) => {
    navigation.push("add-wallet", { blockchain });
  };

  return (
    <Screen>
      <WalletList2 onPressItem={handlePressItem} />
    </Screen>
  );
}

// const styles = StyleSheet.create({
//   sectionHeaderTitle: {
//     fontWeight: "500",
//     marginBottom: 8,
//   },
//   listItem: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//   },
//   listItemLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
// });

export function EditWalletsScreen({ navigation }): JSX.Element {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => <ScreenError error={error} />}
    >
      <Suspense fallback={<ScreenLoading />}>
        <Container navigation={navigation} />
      </Suspense>
    </ErrorBoundary>
  );
}

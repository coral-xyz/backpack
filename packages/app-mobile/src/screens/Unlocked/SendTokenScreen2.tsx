import type { Token } from "@@types/types";
import type { RemoteUserData, SubscriptionType } from "@coral-xyz/common";

import { useEffect, useState } from "react";
import { View, ScrollView } from "react-native";

import { BACKEND_API_URL, Blockchain } from "@coral-xyz/common";
import { useContacts } from "@coral-xyz/db";
import {
  useActiveEthereumWallet,
  useActiveSolanaWallet,
  useAllWallets,
  useAvatarUrl,
  useUser,
} from "@coral-xyz/recoil";
import {
  PrimaryButton,
  DangerButton,
  Box,
  Text,
  YGroup,
  ListItem,
  YStack,
} from "@coral-xyz/tamagui";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SearchInput as BaseSearchInput } from "~components/StyledTextInput";
import { UserAvatar } from "~components/UserAvatar";

export const BubbleTopLabel = ({ text }: { text: string }) => {
  return (
    <Text mb={8} fontSize={15} fontFamily="Inter_500Medium">
      {text}
    </Text>
  );
};

let debouncedTimer = 0;

function NotSelected() {
  return null;
}

export function SendTokenSelectUserScreen({
  blockchain,
  token,
  inputContent,
  setInputContent,
  hasInputError,
  normalizedAddress,
}: {
  blockchain: Blockchain;
  token: Token;
  inputContent: string;
  setInputContent: (content: string) => void;
  hasInputError: boolean;
  normalizedAddress: string;
}): JSX.Element {
  const navigation = useNavigation();
  const [searchResults, setSearchResults] = useState<RemoteUserData[]>([]);
  const isNextButtonDisabled = inputContent.length === 0 || hasInputError;
  const insets = useSafeAreaInsets();

  return (
    <ScrollView style={{ flex: 1 }}>
      <YStack f={1} jc="flex-between" mb={insets.bottom}>
        <View style={{ flex: 1 }}>
          <Box mb={8}>
            <SearchInput
              blockchain={blockchain}
              searchResults={searchResults}
              inputContent={inputContent}
              setInputContent={setInputContent}
              setSearchResults={setSearchResults}
            />
          </Box>
          {!inputContent ? (
            <YourAddresses
              token={token}
              searchFilter={inputContent}
              blockchain={blockchain}
            />
          ) : null}
          <Contacts searchFilter={inputContent} blockchain={blockchain} />
          <SearchResults
            blockchain={blockchain}
            token={token}
            searchResults={searchResults}
          />
        </View>
        <View>
          {hasInputError ? (
            <DangerButton label="Invalid address" disabled onPress={() => {}} />
          ) : (
            <PrimaryButton
              disabled={isNextButtonDisabled}
              label="Next"
              onPress={() => {
                const user = searchResults.find((x) =>
                  x.public_keys.find(
                    (result) => result.publicKey === inputContent
                  )
                );

                navigation.navigate("SendTokenConfirm", {
                  blockchain,
                  token,
                  to: {
                    address: normalizedAddress,
                    username: user?.username,
                    image: user?.image,
                    uuid: user?.uuid,
                  },
                });
              }}
            />
          )}
        </View>
      </YStack>
    </ScrollView>
  );
}

export const SearchInput = ({
  inputContent,
  setInputContent,
  setSearchResults,
  searchResults,
  blockchain,
}: {
  inputContent: string;
  setInputContent: any;
  setSearchResults: any;
  searchResults: RemoteUserData[];
  blockchain: Blockchain;
}) => {
  const fetchUserDetails = async (address: string, blockchain: Blockchain) => {
    try {
      const jwt = await AsyncStorage.getItem("@bk-jwt");
      const url = `${BACKEND_API_URL}/users?usernamePrefix=${address}&blockchain=${blockchain}limit=6`;
      const response = await fetch(url, {
        headers: {
          authorization: `Bearer ${jwt}`,
        },
      });

      const json = await response.json();
      setSearchResults(
        json.users.sort((a: any, b: any) =>
          a.username.length < b.username.length ? -1 : 1
        ) || []
      );
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const debouncedFetchUserDetails = (
    prefix: string,
    blockchain: Blockchain
  ) => {
    clearTimeout(debouncedTimer);
    // @ts-ignore
    debouncedTimer = setTimeout(async () => {
      await fetchUserDetails(prefix, blockchain);
    }, 250);
  };

  useEffect(() => {
    if (inputContent.length >= 2) {
      debouncedFetchUserDetails(inputContent, blockchain);
    } else {
      clearTimeout(debouncedTimer);
    }
  }, [inputContent, blockchain]);

  useEffect(() => {
    if (!inputContent && searchResults.length) {
      setSearchResults([]);
    }
  }, [searchResults, inputContent]);

  return (
    <BaseSearchInput
      placeholder="Enter a username or address"
      value={inputContent}
      onChangeText={(text: string) => setInputContent(text)}
    />
  );
};

const SearchResults = ({
  token,
  blockchain,
  searchResults,
}: {
  blockchain: Blockchain;
  token: Token;
  searchResults: any[];
}) => {
  // Don't show any friends because they will show up under contacts
  // This would be better implemented on the server query because it messes
  // with the limit, i.e. you could filter all the results from the limit
  const filteredSearchResults = searchResults.filter(
    (user) => !user.areFriends
  );

  return (
    <Box>
      {filteredSearchResults.length !== 0 ? (
        <Box mt={10}>
          <BubbleTopLabel text="Other people" />
          <AddressList
            token={token}
            blockchain={blockchain}
            wallets={filteredSearchResults
              .map((user) => ({
                username: user.username,
                image: user.image,
                uuid: user.id,
                addresses: user.public_keys
                  .filter((x: any) => x.blockchain === blockchain)
                  ?.map((x: any) => x.publicKey),
              }))
              .filter((x) => x.addresses.length !== 0)}
          />
        </Box>
      ) : null}
    </Box>
  );
};

function AddressList({
  blockchain,
  token,
  wallets,
}: {
  blockchain: Blockchain;
  token: Token;
  wallets: {
    username: string;
    walletName?: string;
    image: string;
    addresses: string[];
    uuid: string;
  }[];
}) {
  const walletsWithPrimary = wallets.filter((w) => w.addresses?.[0]);

  return (
    <YGroup bordered>
      {walletsWithPrimary.map((wallet, index) => {
        const key = [wallet.username, wallet.walletName].join(":");
        return (
          <AddressListItem
            key={key}
            token={token}
            blockchain={blockchain}
            address={wallet.addresses?.[0]}
            user={{
              walletName: wallet.walletName,
              username: wallet.username,
              image: wallet.image,
              uuid: wallet.uuid,
            }}
          />
        );
      })}
    </YGroup>
  );
}

const AddressListItem = ({
  address,
  blockchain,
  token,
  user,
}: {
  address?: string;
  blockchain: Blockchain;
  token: Token;
  user: {
    username: string;
    walletName?: string;
    image: string;
    uuid: string;
  };
}) => {
  const navigation = useNavigation();
  const title = user.walletName || user.username;

  const handlePress = () => {
    if (!address) {
      return;
    }

    navigation.navigate("SendTokenConfirm", {
      blockchain,
      token,
      to: {
        address,
        username: user.username,
        walletName: user.walletName,
        image: user.image,
        uuid: user.uuid,
      },
    });
  };

  return (
    <YGroup.Item>
      <ListItem
        hoverTheme
        pressTheme
        height={48}
        justifyContent="flex-start"
        icon={<UserAvatar size={32} uri={user.image} />}
        onPress={handlePress}
      >
        <Text fontSize={16} fontFamily="Inter_500Medium">
          {title}
        </Text>
        {!address ? (
          <View
            style={{
              width: 32,
              height: 32,
              backgroundColor: "#E33E3F",
              marginLeft: 8,
            }}
          />
        ) : null}
      </ListItem>
    </YGroup.Item>
  );
};

const YourAddresses = ({
  token,
  blockchain,
  searchFilter,
}: {
  token: Token;
  blockchain: Blockchain;
  searchFilter: string;
}) => {
  const wallets = useAllWallets().filter((x) => x.blockchain === blockchain);
  const { uuid, username } = useUser();
  const avatarUrl = useAvatarUrl();
  const activeSolWallet = useActiveSolanaWallet();
  const activeEthWallet = useActiveEthereumWallet();

  if (wallets.length === 1) {
    // Only one wallet available
    return null;
  }

  return (
    <Box my={12}>
      <BubbleTopLabel text="Your addresses" />
      <AddressList
        blockchain={blockchain}
        token={token}
        wallets={wallets
          .filter((x) => x.blockchain === blockchain)
          .filter(
            (x) =>
              x.publicKey !==
                (blockchain === Blockchain.SOLANA
                  ? activeSolWallet.publicKey
                  : activeEthWallet.publicKey) &&
              x.publicKey.includes(searchFilter)
          )
          .map((wallet) => ({
            username,
            walletName: wallet.name,
            image: avatarUrl,
            uuid,
            addresses: [wallet.publicKey],
          }))}
      />
    </Box>
  );
};

const Contacts = ({
  token,
  blockchain,
  searchFilter,
}: {
  token: Token;
  blockchain: Blockchain;
  searchFilter: string;
}) => {
  const { uuid } = useUser();
  const contacts = useContacts(uuid);

  const filteredContacts = contacts
    .filter((x) => {
      if (x.remoteUsername.includes(searchFilter)) {
        return true;
      }
      if (x.public_keys.find((x) => x.publicKey.includes(searchFilter))) {
        return true;
      }
      return false;
    })
    .filter((x) => !!x.public_keys?.[0]);

  return (
    <Box marginVertical={12}>
      <BubbleTopLabel text="Friends" />
      <AddressList
        blockchain={blockchain}
        token={token}
        wallets={filteredContacts.map((c) => ({
          username: c.remoteUsername,
          addresses: c.public_keys
            .filter(
              (x) =>
                x.blockchain === blockchain &&
                (x.publicKey.includes(searchFilter) ||
                  c.remoteUsername.includes(searchFilter))
            )
            .map((x) => x.publicKey),
          image: c.remoteUserImage,
          uuid: c.remoteUserId,
        }))}
      />
    </Box>
  );
};

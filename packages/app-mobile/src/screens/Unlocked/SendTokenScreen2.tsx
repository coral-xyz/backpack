import type { RemoteUserData } from "@coral-xyz/common";
import type { Token } from "~types/types";

import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";

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
  Box,
  DangerButton,
  ListItem,
  PrimaryButton,
  Text,
  YGroup,
  YStack,
} from "@coral-xyz/tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SearchInput as BaseSearchInput } from "~components/StyledTextInput";
import { UserAvatar } from "~components/UserAvatar";
import { useSession } from "~lib/SessionProvider";

export const BubbleTopLabel = ({ text }: { text: string }) => {
  return (
    <Text mb={8} fontSize={15} fontFamily="InterMedium">
      {text}
    </Text>
  );
};

let debouncedTimer = 0;

type User = {
  walletName?: string;
  username: string;
  image: string;
  uuid: string;
  // addresses: { publicKey: string; blockchain: Blockchain }[];
};

type SelectUserResultProp = {
  user: User;
  address: string;
};

export function SendTokenSelectUserScreen({
  blockchain,
  token,
  inputContent,
  setInputContent,
  hasInputError,
  onSelectUserResult,
  onPressNext,
}: {
  blockchain: Blockchain;
  token: Token;
  inputContent: string;
  setInputContent: (content: string) => void;
  hasInputError: boolean;
  onSelectUserResult: (data: SelectUserResultProp) => void;
  onPressNext: (data: { user: User }) => void;
}): JSX.Element {
  const [searchResults, setSearchResults] = useState<RemoteUserData[]>([]);
  const isNextButtonDisabled = inputContent.length === 0 || hasInputError;
  const insets = useSafeAreaInsets();

  return (
    <ScrollView style={{ flex: 1 }}>
      <YStack flex={1} jc="space-between" mb={insets.bottom}>
        <View style={{ flex: 1 }}>
          <Box marginBottom={8}>
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
              onPressRow={onSelectUserResult}
            />
          ) : null}
          <Contacts
            searchFilter={inputContent}
            blockchain={blockchain}
            onPressRow={onSelectUserResult}
          />
          <SearchResults
            blockchain={blockchain}
            token={token}
            searchResults={searchResults}
            onPressRow={onSelectUserResult}
          />
        </View>
        <View>
          {hasInputError ? (
            <DangerButton label="Invalid address" disabled />
          ) : (
            <PrimaryButton
              label="Next"
              disabled={isNextButtonDisabled}
              onPress={() => {
                const user = searchResults.find((x) =>
                  x.public_keys.find(
                    (result) => result.publicKey === inputContent
                  )
                );

                onPressNext({ user });
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
  const { token } = useSession();
  const fetchUserDetails = async (address: string, blockchain: Blockchain) => {
    try {
      const url = `${BACKEND_API_URL}/users?usernamePrefix=${address}&blockchain=${blockchain}&limit=6`;
      const response = await fetch(url, {
        headers: {
          authorization: `Bearer ${token}`,
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
      onChangeText={(text: string) => setInputContent(text)}
    />
  );
};

const SearchResults = ({
  blockchain,
  searchResults,
  onPressRow,
}: {
  blockchain: Blockchain;
  token: Token;
  searchResults: any[];
  onPressRow: (data: any) => void;
}) => {
  // Don't show any friends because they will show up under contacts
  // This would be better implemented on the server query because it messes
  // with the limit, i.e. you could filter all the results from the limit
  const filteredSearchResults = searchResults.filter(
    (user) => !user.areFriends
  );

  const parsedWallets = filteredSearchResults
    .map((user) => ({
      username: user.username,
      image: user.image,
      uuid: user.id,
      addresses: user.public_keys
        .filter((x: any) => x.blockchain === blockchain)
        ?.map((x: any) => x.publicKey),
    }))
    .filter((x) => x.addresses.length !== 0);

  if (filteredSearchResults.length === 0) {
    return null;
  }

  return (
    <Section
      title="Other people"
      wallets={parsedWallets}
      onPressRow={onPressRow}
    />
  );
};

const YourAddresses = ({
  blockchain,
  searchFilter,
  onPressRow,
}: {
  token: Token;
  blockchain: Blockchain;
  searchFilter: string;
  onPressRow: (data: SelectUserResultProp) => void;
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

  const parsedWallets = wallets
    .filter((x) => x.blockchain === blockchain)
    .filter(
      (x) =>
        x.publicKey !==
          (blockchain === Blockchain.SOLANA
            ? activeSolWallet.publicKey
            : activeEthWallet.publicKey) && x.publicKey.includes(searchFilter)
    )
    .map((wallet) => ({
      username,
      walletName: wallet.name,
      image: avatarUrl,
      uuid,
      addresses: [wallet.publicKey],
    }));

  return (
    <Section
      title="Your addresses"
      wallets={parsedWallets}
      onPressRow={onPressRow}
    />
  );
};

const Contacts = ({
  blockchain,
  searchFilter,
  onPressRow,
}: {
  blockchain: Blockchain;
  searchFilter: string;
  onPressRow: (data: SelectUserResultProp) => void;
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

  const parsedWallets = filteredContacts.map((c) => ({
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
  }));

  return (
    <Section title="Friends" wallets={parsedWallets} onPressRow={onPressRow} />
  );
};

function Section({
  title,
  wallets,
  onPressRow,
}: {
  title: string;
  wallets: any[];
  onPressRow: (data: SelectUserResultProp) => void;
}) {
  if (wallets.length === 0) {
    return null;
  }

  return (
    <Box marginVertical={12}>
      <BubbleTopLabel text={title} />
      <AddressList wallets={wallets} onPressRow={onPressRow} />
    </Box>
  );
}

function AddressList({
  wallets,
  onPressRow,
}: {
  onPressRow: (data: SelectUserResultProp) => void;
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
      {walletsWithPrimary.map((wallet) => {
        const key = [wallet.username, wallet.walletName].join(":");
        const address = wallet.addresses?.[0];
        const user = {
          walletName: wallet.walletName,
          username: wallet.username,
          image: wallet.image,
          uuid: wallet.uuid,
        };

        return (
          <AddressListItem
            key={key}
            address={address}
            user={user}
            onPress={() => {
              if (address) {
                onPressRow({ user, address });
              }
            }}
          />
        );
      })}
    </YGroup>
  );
}

const AddressListItem = ({
  address,
  user,
  onPress,
}: {
  address?: string;
  onPress: () => void;
  user: {
    username: string;
    walletName?: string;
    image: string;
    uuid: string;
  };
}) => {
  const title = user.walletName || user.username;
  return (
    <YGroup.Item>
      <ListItem
        hoverTheme
        pressTheme
        height={48}
        backgroundColor="$nav"
        justifyContent="flex-start"
        icon={<UserAvatar size={32} uri={user.image} />}
        onPress={onPress}
      >
        <Text fontSize={16} fontFamily="InterMedium">
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

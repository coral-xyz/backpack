import type { Token } from "@@types/types";
import type { RemoteUserData } from "@coral-xyz/common";

import { useEffect } from "react";
import { View } from "react-native";

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

import { ImageSvg } from "~components/ImageSvg";
import { StyledTextInput } from "~components/StyledTextInput";

export const BubbleTopLabel = ({ text }: { text: string }) => {
  return <Text mb={8}>{text}</Text>;
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
  // const [searchResults, setSearchResults] =
  //   useState<RemoteUserData[]>(SEARCH_RESULTS);
  const searchResults = SEARCH_RESULTS;
  const isNextButtonDisabled = inputContent.length === 0 || hasInputError;

  return (
    <YStack f={1} jc="flex-between">
      <View style={{ flex: 1 }}>
        <SearchInput
          blockchain={blockchain}
          searchResults={searchResults}
          inputContent={inputContent}
          setInputContent={setInputContent}
          setSearchResults={console.log}
        />
        {!inputContent ? (
          <YourAddresses searchFilter={inputContent} blockchain={blockchain} />
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
                address: normalizedAddress || inputContent,
                username: user?.username,
                image: user?.image,
                uuid: user?.uuid,
              });
            }}
          />
        )}
      </View>
    </YStack>
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
      console.log("json", json);
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
    <StyledTextInput
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
            blockchain={blockchain}
            token={token}
            key={key}
            isFirst={index === 0}
            isLast={index === walletsWithPrimary.length - 1}
            user={{
              walletName: wallet.walletName,
              username: wallet.username,
              image: wallet.image,
              uuid: wallet.uuid,
            }}
            address={wallet.addresses?.[0]}
          />
        );
      })}
    </YGroup>
  );
}

const AddressListItem = ({
  address,
  blockchain,
  isFirst,
  isLast,
  token,
  user,
}: {
  address?: string;
  blockchain: Blockchain;
  isFirst: boolean;
  isLast: boolean;
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
  return (
    <YGroup.Item>
      <ListItem
        hoverTheme
        pressTheme
        px={8}
        py={8}
        title={title}
        icon={<ImageSvg width={32} height={32} uri={user.image} />}
        onPress={() => {
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
        }}
      >
        {!address ? (
          <View
            style={{
              width: 32,
              height: 32,
              backgroundColor: "#E33E3F",
              marginLeft: 10,
            }}
          />
        ) : null}
      </ListItem>
    </YGroup.Item>
  );
};

const YourAddresses = ({
  blockchain,
  searchFilter,
}: {
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
    <Box m={12}>
      <BubbleTopLabel text="Your addresses" />
      <AddressList
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
  blockchain,
  searchFilter,
}: {
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
    <Box>
      {filteredContacts.length !== 0 ? (
        <Box m={12}>
          <BubbleTopLabel text="Friends" />
          <AddressList
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
      ) : null}
    </Box>
  );
};

const SEARCH_RESULTS = [
  {
    id: "6ecf7d82-095d-4fa3-9830-3567b286066d",
    username: "peter",
    image: "https://swr.xnfts.dev/avatars/peter",
    requested: true,
    remoteRequested: false,
    areFriends: false,
    public_keys: [
      {
        blockchain: "ethereum",
        publicKey: "0x513F48Aae2e1f6927dD37b9197Aa8dE87f57DADD",
        primary: true,
      },
      {
        blockchain: "solana",
        publicKey: "5iM4vFHv7vdiZJYm7rQwHGgvpp9zHEwZHGNbNATFF5To",
        primary: true,
      },
    ],
  },
  {
    id: "709f31be-fad6-4e10-8894-f39d70e0ea63",
    username: "peter3",
    image: "https://swr.xnfts.dev/avatars/peter3",
    requested: false,
    remoteRequested: false,
    areFriends: false,
    public_keys: [
      {
        blockchain: "ethereum",
        publicKey: "0xF59F88CD68900F5042D1986Ca8eB052e511C9b2A",
        primary: true,
      },
    ],
  },
  {
    id: "03499ef3-deec-4233-9bbe-0f2336e2e1d8",
    username: "peter4",
    image: "https://swr.xnfts.dev/avatars/peter4",
    requested: false,
    remoteRequested: false,
    areFriends: false,
    public_keys: [
      {
        blockchain: "solana",
        publicKey: "Gcng5VSEJNGVPCtgENqRYBcF65Nc7YC3XbhrXWCBvU4L",
        primary: true,
      },
    ],
  },
  {
    id: "6f252a38-cdc2-485a-abe6-c09cf7685902",
    username: "peter69",
    image: "https://swr.xnfts.dev/avatars/peter69",
    requested: false,
    remoteRequested: false,
    areFriends: false,
    public_keys: [
      {
        blockchain: "solana",
        publicKey: "4PRQFpiPHWEuJ45tdjYsBq3EPAspPVe6vGBqmW8GQWv1",
        primary: true,
      },
    ],
  },
  {
    id: "c676ea81-a7e2-44ee-bbce-42da38ca35cd",
    username: "peter007",
    image: "https://swr.xnfts.dev/avatars/peter007",
    requested: false,
    remoteRequested: false,
    areFriends: false,
    public_keys: [
      {
        blockchain: "solana",
        publicKey: "KeAYJypftXR6DnJso9iSWqDuqjGZPc2Y29RAgsPos5k",
        primary: true,
      },
    ],
  },
  {
    id: "4b1729c9-51e0-4436-b7ac-ee55ea88d1a4",
    username: "peter123",
    image: "https://swr.xnfts.dev/avatars/peter123",
    requested: false,
    remoteRequested: false,
    areFriends: false,
    public_keys: [
      {
        blockchain: "solana",
        publicKey: "J9kpkp6NiivKZyNf1qhx5ZerffetmSsqV5MZqLNKVuQ3",
        primary: true,
      },
    ],
  },
  {
    id: "11b8b9e6-b5ae-4068-a204-c2c4700d0129",
    username: "peter619",
    image: "https://swr.xnfts.dev/avatars/peter619",
    requested: false,
    remoteRequested: false,
    areFriends: false,
    public_keys: [
      {
        blockchain: "solana",
        publicKey: "2jVoHqno1WcLSLdi13vpqyXqrpzhZogHj92gh1D3H3HF",
        primary: true,
      },
    ],
  },
  {
    id: "2c501ea3-d3e1-414f-b162-d4cbdb6f5ec5",
    username: "peterkiu",
    image: "https://swr.xnfts.dev/avatars/peterkiu",
    requested: false,
    remoteRequested: false,
    areFriends: false,
    public_keys: [
      {
        blockchain: "solana",
        publicKey: "7TKFoQHrJuyoRa3rifZWgkcynR4RXe6t4YescVReGByA",
        primary: true,
      },
    ],
  },
  {
    id: "97850fb9-8b4e-42a1-9c1a-35a5c2537b8e",
    username: "peter1125",
    image: "https://swr.xnfts.dev/avatars/peter1125",
    requested: false,
    remoteRequested: false,
    areFriends: false,
    public_keys: [
      {
        blockchain: "solana",
        publicKey: "6T7U37ZotZw3fogMKrfgv3rwbo9ACsvuvCgeZd27MgYd",
        primary: true,
      },
    ],
  },
  {
    id: "bce79939-a395-4f8c-b002-65c5ea828633",
    username: "peteralika",
    image: "https://swr.xnfts.dev/avatars/peteralika",
    requested: false,
    remoteRequested: false,
    areFriends: false,
    public_keys: [
      {
        blockchain: "ethereum",
        publicKey: "0xD51075eD9B8640319D61B807Fd3d4d9538a390D0",
        primary: true,
      },
    ],
  },
  {
    id: "a899c4a7-1580-44cd-9172-b48740581702",
    username: "petergover",
    image: "https://swr.xnfts.dev/avatars/petergover",
    requested: false,
    remoteRequested: false,
    areFriends: false,
    public_keys: [
      {
        blockchain: "solana",
        publicKey: "26LVumfUCt5NazCBM244rsdDVT5oa4gAw8PxPRbKE28r",
        primary: true,
      },
    ],
  },
  {
    id: "8ba31886-8d4d-43cd-a4b1-8e0c5ca5c4d6",
    username: "peterburke9",
    image: "https://swr.xnfts.dev/avatars/peterburke9",
    requested: false,
    remoteRequested: false,
    areFriends: false,
    public_keys: [
      {
        blockchain: "solana",
        publicKey: "8vLnkiUj6atuf542putiUefvKYVAx3TpYv71cKaeTVUg",
        primary: true,
      },
    ],
  },
  {
    id: "b6d761f9-f278-4adf-9e65-837f8086de58",
    username: "peterclevar",
    image: "https://swr.xnfts.dev/avatars/peterclevar",
    requested: false,
    remoteRequested: false,
    areFriends: false,
    public_keys: [
      {
        blockchain: "solana",
        publicKey: "FS3kNjDyK5h8BGYvvGRhy3GQ1JGB81RUPevdXhKYNA8u",
        primary: true,
      },
    ],
  },
  {
    id: "6d6506b6-8cd6-4a1b-86be-23d65df97f8c",
    username: "peterfis128",
    image: "https://swr.xnfts.dev/avatars/peterfis128",
    requested: false,
    remoteRequested: false,
    areFriends: false,
    public_keys: [
      {
        blockchain: "solana",
        publicKey: "Ar2AMZkhqPTsmc2Lcrd28fVTVe9wBtutkAMxpCE3AWAA",
        primary: true,
      },
    ],
  },
  {
    id: "08db56b0-2d15-4a14-98f4-fc304ff71ccf",
    username: "peterbwarren",
    image: "https://swr.xnfts.dev/avatars/peterbwarren",
    requested: false,
    remoteRequested: false,
    areFriends: false,
    public_keys: [
      {
        blockchain: "solana",
        publicKey: "693WDpxKQeEjMamwBrqwXKVxY4c8nownT6uKeJbbAr8Q",
        primary: true,
      },
    ],
  },
  {
    id: "28a23b61-ddcd-491a-820b-8704678190df",
    username: "peterclevar1",
    image: "https://swr.xnfts.dev/avatars/peterclevar1",
    requested: false,
    remoteRequested: false,
    areFriends: false,
    public_keys: [
      {
        blockchain: "solana",
        publicKey: "4F995cetnegAMLfmGvSCeysPbYk3i1hjPpAXRCNtHEK1",
        primary: true,
      },
    ],
  },
  {
    id: "d8fadc15-f11b-4b5b-b1f2-07e95bb5afd6",
    username: "peterclinepe",
    image: "https://swr.xnfts.dev/avatars/peterclinepe",
    requested: false,
    remoteRequested: false,
    areFriends: false,
    public_keys: [
      {
        blockchain: "solana",
        publicKey: "J27RYWSaWLhh9VRt6CNzegXMiaZUFZYgQjMeddv8mkX8",
        primary: true,
      },
    ],
  },
  {
    id: "3537fdc7-a4a8-4417-b4ce-6ec6d31d5639",
    username: "peterhassaan",
    image: "https://swr.xnfts.dev/avatars/peterhassaan",
    requested: false,
    remoteRequested: false,
    areFriends: false,
    public_keys: [
      {
        blockchain: "solana",
        publicKey: "EtYsN7SG2m3pwMYABFH7KtQPukKLPMRiY7w1dbiBweAV",
        primary: true,
      },
    ],
  },
  {
    id: "7f8c2bb2-e9d2-43b8-9b92-6ef17e7cf33d",
    username: "peteraywardly",
    image: "https://swr.xnfts.dev/avatars/peteraywardly",
    requested: false,
    remoteRequested: false,
    areFriends: false,
    public_keys: [
      {
        blockchain: "ethereum",
        publicKey: "0xc3adf145c8b9f5D9a0Bf722E434109B525b0b7fF",
        primary: true,
      },
      {
        blockchain: "solana",
        publicKey: "9CnobJMVHsqUTNS6WVfxvMPyEAtr39e5cuLYg8RVzUtF",
        primary: true,
      },
    ],
  },
  {
    id: "68e0e706-816c-4387-ba22-7f6104e30140",
    username: "peterjchalmers",
    image: "https://swr.xnfts.dev/avatars/peterjchalmers",
    requested: false,
    remoteRequested: false,
    areFriends: false,
    public_keys: [
      {
        blockchain: "solana",
        publicKey: "AnBqcuxFT8jmVNrs2dB5DN78uEKmJs75W56NmxxyUXdT",
        primary: true,
      },
    ],
  },
];

import type { RemoteUserData } from "@coral-xyz/common";
import type { TokenDataWithPrice } from "@coral-xyz/recoil";

import { useContext, useEffect, useState } from "react";

import { BACKEND_API_URL, Blockchain } from "@coral-xyz/common";
import { useContacts } from "@coral-xyz/db";
import {
  blockchainTokenData,
  useActiveEthereumWallet,
  useActiveSolanaWallet,
  useActiveWallet,
  useAllWallets,
  useAnchorContext,
  useAvatarUrl,
  useEthereumCtx,
  useLoader,
  useUser,
} from "@coral-xyz/recoil";
import {
  PrimaryButton,
  DangerButton,
  // SearchBox,
  // YStack,
  // Input,
  ScrollView,
  Box,
  Text,
  YGroup,
  ListItem,
} from "@coral-xyz/tamagui";

import { StyledTextInput } from "~components/StyledTextInput";

// TODO(peter) share between extension, put this into recoil
import { useIsValidAddress } from "~hooks/useIsValidAddress";

export const BubbleTopLabel = ({ text }: { text: string }) => {
  return <Text>{text}</Text>;
};

let debouncedTimer = 0;

// import { Screen } from "~components/index";

function NotSelected() {
  return null;
}

export function SendTokenSelectUserScreen({ navigation, route }): JSX.Element {
  const { blockchain, token } = route.params;
  const { provider: solanaProvider } = useAnchorContext();
  const ethereumCtx = useEthereumCtx();

  const [searchResults, setSearchResults] = useState<RemoteUserData[]>([]);
  const [inputContent, setInputContent] = useState("");

  const { isValidAddress, normalizedAddress } = useIsValidAddress(
    blockchain,
    inputContent,
    solanaProvider.connection,
    ethereumCtx.provider
  );

  console.log("blockchain", blockchain);
  console.log("inputContent", inputContent);
  console.log("isValidAddress", isValidAddress);
  console.log("normalizedAddress", normalizedAddress);

  const hasInputError = !isValidAddress && inputContent.length > 15;
  console.log("searchResults", searchResults);

  return (
    <ScrollView p={16} f={1} jc="space-between">
      <SearchInput
        blockchain={blockchain}
        searchResults={searchResults}
        inputContent={inputContent}
        setInputContent={setInputContent}
        setSearchResults={setSearchResults}
      />
      {!inputContent ? (
        <YourAddresses searchFilter={inputContent} blockchain={blockchain} />
      ) : null}
      <Contacts searchFilter={inputContent} blockchain={blockchain} />
      <SearchResults searchResults={searchResults} blockchain={blockchain} />
      {hasInputError ? (
        <DangerButton label="Invalid address" disabled onPress={() => {}} />
      ) : (
        <PrimaryButton
          disabled={!isValidAddress}
          label="Next"
          onPress={() => {
            const user = searchResults.find((x) =>
              x.public_keys.find((result) => result.publicKey === inputContent)
            );

            navigation.navigate("SendDetail", {
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
    </ScrollView>
  );
}

const SearchInput = ({
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
      const response = await fetch(
        `${BACKEND_API_URL}/users?usernamePrefix=${address}&blockchain=${blockchain}limit=6`
      );
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
    <StyledTextInput
      placeholder="Enter a username or address"
      // startAdornment={
      //   <InputAdornment position="start">
      //     <SearchIcon style={{ color: theme.custom.colors.icon }} />
      //   </InputAdornment>
      // }
      value={inputContent}
      onChangeText={(text: string) => setInputContent(text)}
      // setValue={(e) => setInputContent(e.target.value.trim())}
      // error={isErrorAddress}
      // inputProps={{
      //   name: "to",
      //   spellCheck: "false",
      //   style: {
      //   },
      // }}
      // margin="none"
    />
  );
};

const SearchResults = ({
  searchResults,
  blockchain,
}: {
  searchResults: any[];
  blockchain: Blockchain;
}) => {
  // Don't show any friends because they will show up under contacts
  // This would be better implemented on the server query because it messes
  // with the limit, i.e. you could filter all the results from the limit
  const filteredSearchResults = searchResults.filter(
    (user) => !user.areFriends
  );

  return (
    <Box mx={12}>
      {filteredSearchResults.length !== 0 ? (
        <Box mt={10}>
          <BubbleTopLabel text="Other people" />
          <AddressList
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
  wallets,
}: {
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
    <YGroup als="center" bordered w={240} size="$4">
      {walletsWithPrimary.map((wallet) => {
        const key = [wallet.username, wallet.walletName].join(":");
        return (
          <YGroup.Item key={key}>
            <ListItem hoverTheme>
              <Text>{key}</Text>
            </ListItem>
          </YGroup.Item>
        );
      })}
    </YGroup>
  );
}

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

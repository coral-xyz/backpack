import React, { useContext, useEffect, useState } from "react";
import type { RemoteUserData } from "@coral-xyz/common";
import { BACKEND_API_URL, Blockchain } from "@coral-xyz/common";
import { useContacts } from "@coral-xyz/db";
import { ParentCommunicationManager } from "@coral-xyz/message-sdk";
import {
  BubbleTopLabel,
  DangerButton,
  isFirstLastListItemStyle,
  PrimaryButton,
  TextInput,
  UserIcon,
} from "@coral-xyz/react-common";
import {
  blockchainTokenData,
  useActiveEthereumWallet,
  useActiveSolanaWallet,
  useActiveWallet,
  useAllWallets,
  useAnchorContext,
  useAvatarUrl,
  useEthereumCtx,
  useIsValidAddress,
  useLoader,
  useUser,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import BlockIcon from "@mui/icons-material/Block";
import SearchIcon from "@mui/icons-material/Search";
import { List, ListItemButton } from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import { createStyles, makeStyles } from "@mui/styles";

import {
  useNavigation,
  useNavigation as useNavigationEphemeral,
} from "../../../common/Layout/NavStack";

let debouncedTimer = 0;

export interface SendData {
  address: string;
  username?: string;
  image?: string;
  uuid?: string;
  walletName?: string;
}

const useStyles = makeStyles((theme: any) =>
  createStyles({
    container: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
    },
    topHalf: {
      flex: 1,
    },
    userText: {
      fontSize: 16,
      marginTop: 4,
      color: theme.custom.colors.fontColor2,
    },
    buttonContainer: {
      display: "flex",
      paddingLeft: "12px",
      paddingRight: "12px",
      paddingBottom: "24px",
      paddingTop: "25px",
      justifyContent: "space-between",
    },
  })
);

type AddressSelectorContext = {
  blockchain: Blockchain;
  name: string;
  onSelect: (sendData: SendData) => void;
};

const AddressSelectorContext =
  React.createContext<AddressSelectorContext | null>(null);

function AddressSelectorProvider(props: {
  blockchain: Blockchain;
  name: string;
  onSelect: (sendData: SendData) => void;
  children: any;
}) {
  return (
    <AddressSelectorContext.Provider
      value={{
        blockchain: props.blockchain,
        name: props.name,
        onSelect: props.onSelect,
      }}
    >
      {props.children}
    </AddressSelectorContext.Provider>
  );
}

function useAddressSelectorContext(): AddressSelectorContext {
  const ctx = useContext(AddressSelectorContext);
  if (!ctx) {
    throw new Error("context not found");
  }
  return ctx;
}

export const AddressSelectorLoader = ({
  publicKey,
  blockchain,
  address,
}: {
  publicKey?: string;
  blockchain: Blockchain;
  address: string;
}) => {
  // publicKey should only be undefined if the user is in single-wallet mode
  // (rather than aggregate mode).
  const activePublicKey = useActiveWallet().publicKey;
  const publicKeyStr = publicKey ?? activePublicKey;
  const { push } = useNavigation();
  const [token] = useLoader(
    blockchainTokenData({
      publicKey: publicKeyStr,
      blockchain,
      tokenAddress: address,
    }),
    null
  );
  if (!token) return null;
  return (
    <AddressSelector
      blockchain={blockchain}
      name={token.ticker}
      onSelect={(sendData) => {
        push("send", {
          blockchain,
          token,
          to: sendData,
        });
      }}
    />
  );
};

export const TokenAddressSelector = (props: any) => {
  const { push } = useNavigation();

  return (
    <AddressSelector
      {...props}
      onSelect={(sendData) => {
        push("send", {
          blockchain: props.blockchain,
          token: props.token,
          to: sendData,
        });
      }}
    />
  );
};

export const AddressSelector = ({
  blockchain,
  name,
  onSelect,
}: {
  blockchain: Blockchain;
  name: string;
  onSelect: (sendData: SendData) => void;
}) => {
  const classes = useStyles();
  const nav = useNavigationEphemeral();
  const [inputContent, setInputContent] = useState("");
  const { provider: solanaProvider } = useAnchorContext();
  const ethereumCtx = useEthereumCtx();
  const [searchResults, setSearchResults] = useState<RemoteUserData[]>([]);
  const { isValidAddress, isErrorAddress, normalizedAddress } =
    useIsValidAddress(
      blockchain,
      inputContent,
      solanaProvider.connection,
      ethereumCtx.provider
    );

  useEffect(() => {
    const prev = nav.title;
    nav.setOptions({ headerTitle: `Send ${name}` });
    return () => {
      nav.setOptions({ headerTitle: prev });
    };
  }, []);

  return (
    <AddressSelectorProvider
      blockchain={blockchain}
      name={name}
      onSelect={onSelect}
    >
      <div className={classes.container}>
        <div className={classes.topHalf}>
          <SearchInput
            searchResults={searchResults}
            inputContent={inputContent}
            setInputContent={setInputContent}
            setSearchResults={setSearchResults}
          />
          {!inputContent ? (
            <YourAddresses
              searchFilter={inputContent}
              blockchain={blockchain}
            />
          ) : null}
          <Contacts searchFilter={inputContent} blockchain={blockchain} />
          <SearchResults
            searchResults={searchResults}
            blockchain={blockchain}
          />
          <NotSelected
            searchResults={searchResults}
            searchFilter={inputContent}
          />
        </div>
        <div className={classes.buttonContainer}>
          {isErrorAddress || (!isValidAddress && inputContent.length > 15) ? (
            <DangerButton label="Invalid address" disabled />
          ) : (
            <PrimaryButton
              onClick={() => {
                const user = searchResults.find((x) =>
                  x.public_keys.find(
                    (result) => result.publicKey === inputContent
                  )
                );
                onSelect({
                  address: normalizedAddress || inputContent,
                  username: user?.username,
                  image: user?.image,
                  uuid: user?.id,
                });
              }}
              disabled={!isValidAddress}
              label="Next"
              type="submit"
              data-testid="Send"
            />
          )}
        </div>
      </div>
    </AddressSelectorProvider>
  );
};

function NotSelected({
  searchFilter,
  searchResults,
}: {
  searchFilter: string;
  searchResults: any[];
}) {
  const { uuid } = useUser();
  const contacts = useContacts(uuid);
  const theme = useCustomTheme();
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
    .filter((x) => (x.public_keys?.[0] ? false : true));
  const allResults = [
    ...filteredContacts,
    ...searchResults
      .filter((x) => !x.public_keys?.[0])
      .map((x) => ({
        remoteUsername: x.username,
        remoteUserImage: x.image,
      })),
  ];

  if (!allResults.length) {
    return null;
  }

  return (
    <div style={{ padding: 10 }}>
      <BubbleTopLabel text="Users without a primary wallet" />
      <ListItemButton
        disableRipple
        onClick={() => {}}
        style={{
          paddingLeft: "12px",
          paddingRight: "12px",
          paddingTop: "8px",
          paddingBottom: "8px",
          display: "flex",
          height: "48px",
          backgroundColor: theme.custom.colors.nav,
          ...isFirstLastListItemStyle(true, true, 12),
        }}
      >
        <div style={{ paddingTop: 15 }}>
          <MembersList
            members={allResults.map((x) => ({
              image: x.remoteUserImage,
              username: x.remoteUsername,
            }))}
          />
        </div>
      </ListItemButton>
    </div>
  );
}

function MembersList({
  members,
}: {
  members: { image: string; username: string }[];
}) {
  const theme = useCustomTheme();
  const MEMBER_THRESHOLD = 3;
  const classes = useStyles();
  const renderMembersStr = () => {
    if (members.length <= MEMBER_THRESHOLD) {
      return members.map(
        (member, index) =>
          member.username + `${index === members.length - 1 ? "" : ", "}`
      );
    } else {
      return `${members
        .slice(0, 3)
        .map(
          (member, index) =>
            member.username + `${index === members.length - 1 ? "" : ", "}`
        )} + ${members.length - 3}`;
    }
  };

  return (
    <div
      style={{
        justifyContent: "center",
        display: "flex",
        alignItems: "center",
        paddingBottom: 20,
      }}
    >
      {members.slice(0, 3).map((member, idx) => (
        <img
          key={idx}
          src={member.image}
          style={{
            border: `solid 2px ${theme.custom.colors.nav}`,
            borderRadius: "50%",
            height: 30,
            width: 30,
            ...(idx > 0 ? { marginLeft: "-12px" } : {}),
          }}
        />
      ))}
      <div
        style={{
          color: theme.custom.colors.smallTextColor,
          paddingLeft: 10,
          textOverflow: "ellipsis",
        }}
        className={classes.userText}
      >
        {renderMembersStr()}
      </div>
    </div>
  );
}

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
    .filter((x) => (x.public_keys?.[0] ? true : false));

  return (
    <div>
      {filteredContacts.length !== 0 ? (
        <div style={{ margin: "12px 12px" }}>
          <BubbleTopLabel text="Friends" />
          <AddressList
            wallets={filteredContacts
              .map((c) => ({
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
              }))
              .sort((a: any, b: any) =>
                a.username[0] < b.username[0] ? -1 : 1
              )}
          />
        </div>
      ) : null}
    </div>
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
    <div style={{ margin: "12px 12px" }}>
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
            uuid: uuid,
            addresses: [wallet.publicKey],
          }))}
      />
    </div>
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
  const theme = useCustomTheme();

  const walletsWithPrimary = wallets.filter((w) => w.addresses?.[0]);

  return (
    <List
      style={{
        paddingTop: 0,
        paddingBottom: 0,
        borderRadius: "14px",
        border: `${theme.custom.colors.borderFull}`,
      }}
    >
      {walletsWithPrimary.map((wallet, index) => (
        <AddressListItem
          key={[wallet.username, wallet.walletName].join(":")}
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
      ))}
    </List>
  );
}

const AddressListItem = ({
  user,
  address,
  isFirst,
  isLast,
}: {
  user: {
    username: string;
    walletName?: string;
    image: string;
    uuid: string;
  };
  address?: string;
  isFirst: boolean;
  isLast: boolean;
}) => {
  const theme = useCustomTheme();
  const classes = useStyles();
  const { onSelect } = useAddressSelectorContext();

  return (
    <ListItemButton
      disableRipple
      onClick={() => {
        if (!address) {
          return;
        }
        onSelect({
          address: address,
          username: user.username,
          walletName: user.walletName,
          image: user.image,
          uuid: user.uuid,
        });
      }}
      style={{
        paddingLeft: "12px",
        paddingRight: "12px",
        paddingTop: "8px",
        paddingBottom: "8px",
        display: "flex",
        height: "48px",
        backgroundColor: theme.custom.colors.nav,
        borderBottom: isLast
          ? undefined
          : `solid 1pt ${theme.custom.colors.border}`,
        ...isFirstLastListItemStyle(isFirst, isLast, 12),
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <UserIcon size={32} image={user.image} />
        </div>
        <div style={{ display: "flex" }}>
          <div className={classes.userText}>
            {user.walletName || user.username}
          </div>
          {!address ? (
            <BlockIcon style={{ color: "#E33E3F", marginLeft: 10 }} />
          ) : null}
        </div>
      </div>
    </ListItemButton>
  );
};

const SearchInput = ({
  inputContent,
  setInputContent,
  setSearchResults,
  searchResults,
}: {
  inputContent: string;
  setInputContent: any;
  setSearchResults: any;
  searchResults: any[];
}) => {
  const theme = useCustomTheme();
  const { blockchain } = useAddressSelectorContext();

  const fetchUserDetails = async (address: string, blockchain: Blockchain) => {
    try {
      const response = await ParentCommunicationManager.getInstance().fetch(
        `${BACKEND_API_URL}/users?usernamePrefix=${address}&blockchain=${blockchain}&limit=6`
      );
      const json = await response.json();
      setSearchResults(
        json.users.sort((a: any, b: any) =>
          a.username.length < b.username.length ? -1 : 1
        ) || []
      );
    } catch (e) {
      console.error(e);
    }
  };

  const debouncedFetchUserDetails = (
    prefix: string,
    blockchain: Blockchain
  ) => {
    clearTimeout(debouncedTimer);
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
    <div style={{ margin: "0 12px" }}>
      <TextInput
        placeholder="Enter a username or address"
        startAdornment={
          <InputAdornment position="start">
            <SearchIcon style={{ color: theme.custom.colors.icon }} />
          </InputAdornment>
        }
        value={inputContent}
        setValue={(e) => setInputContent(e.target.value.trim())}
        // error={isErrorAddress}
        inputProps={{
          name: "to",
          spellCheck: "false",
          style: {
            height: "48px",
            paddingTop: 0,
            paddingBottom: 0,
          },
        }}
        margin="none"
      />
    </div>
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
    <div style={{ margin: "0 12px" }}>
      {filteredSearchResults.length !== 0 ? (
        <div style={{ marginTop: 10 }}>
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
        </div>
      ) : null}
    </div>
  );
};

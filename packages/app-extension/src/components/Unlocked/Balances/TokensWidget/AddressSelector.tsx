import React, { useContext, useEffect, useState } from "react";
import type { RemoteUserData } from "@coral-xyz/common";
import { BACKEND_API_URL, Blockchain } from "@coral-xyz/common";
import { useContacts } from "@coral-xyz/db";
import { ParentCommunicationManager } from "@coral-xyz/message-sdk";
import {
  DangerButton,
  isFirstLastListItemStyle,
  PrimaryButton,
  TextInput,
  UserIcon,
} from "@coral-xyz/react-common";
import type { TokenDataWithPrice } from "@coral-xyz/recoil";
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
import { useCustomTheme } from "@coral-xyz/themes";
import BlockIcon from "@mui/icons-material/Block";
import SearchIcon from "@mui/icons-material/Search";
import { List, ListItem } from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import { createStyles, makeStyles } from "@mui/styles";

import {
  useNavigation,
  useNavigation as useNavigationEphemeral,
} from "../../../common/Layout/NavStack";

import { useIsValidAddress } from "./Send";

let debouncedTimer = 0;

const useStyles = makeStyles((theme: any) =>
  createStyles({
    hoverParent: {
      "&:hover $hoverChild, & .Mui-focused $hoverChild": {
        visibility: "visible",
      },
    },
    hoverChild: {
      visibility: "hidden",
    },
    container: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
    },
    topHalf: {
      flex: 1,
    },
    title: {
      color: theme.custom.colors.fontColor,
    },
    userText: {
      fontSize: 16,
      marginTop: 4,
      color: theme.custom.colors.fontColor2,
    },
    address: {
      fontWeight: 500,
      fontSize: 14,
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
  token: TokenDataWithPrice;
};

const AddressSelectorContext =
  React.createContext<AddressSelectorContext | null>(null);
export function AddressSelectorProvider(props: {
  blockchain: Blockchain;
  token: TokenDataWithPrice;
  children: any;
}) {
  return (
    <AddressSelectorContext.Provider
      value={{
        blockchain: props.blockchain,
        token: props.token,
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
  const publicKeyStr = publicKey ?? useActiveWallet().publicKey;
  const [token] = useLoader(
    blockchainTokenData({
      publicKey: publicKeyStr,
      blockchain,
      tokenAddress: address,
    }),
    null
  );
  if (!token) return <></>;
  return <AddressSelector blockchain={blockchain} token={token} />;
};

export const AddressSelector = ({
  blockchain,
  token,
}: {
  blockchain: Blockchain;
  token: TokenDataWithPrice;
}) => {
  const classes = useStyles();
  const nav = useNavigationEphemeral();
  const [inputContent, setInputContent] = useState("");
  const { provider: solanaProvider } = useAnchorContext();
  const ethereumCtx = useEthereumCtx();
  const [searchResults, setSearchResults] = useState<RemoteUserData[]>([]);
  const { push } = useNavigation();
  const { isValidAddress } = useIsValidAddress(
    blockchain,
    inputContent,
    solanaProvider.connection,
    ethereumCtx.provider
  );

  useEffect(() => {
    const prev = nav.title;
    nav.setOptions({ headerTitle: `Send ${token.ticker}` });
    return () => {
      nav.setOptions({ headerTitle: prev });
    };
  }, []);

  return (
    <AddressSelectorProvider blockchain={blockchain} token={token}>
      <div className={classes.container}>
        <div className={classes.topHalf}>
          <SearchAddress
            searchResults={searchResults}
            setSearchResults={setSearchResults}
            inputContent={inputContent}
            setInputContent={setInputContent}
            blockchain={blockchain}
          />
          {!inputContent && (
            <YourAddresses
              searchFilter={inputContent}
              blockchain={blockchain}
            />
          )}
          <Contacts searchFilter={inputContent} blockchain={blockchain} />
          <NotSelected
            searchResults={searchResults}
            searchFilter={inputContent}
          />
        </div>
        <div className={classes.buttonContainer}>
          {!isValidAddress && inputContent.length > 15 ? (
            <DangerButton label="Invalid address" disabled={true} />
          ) : (
            <PrimaryButton
              onClick={() => {
                push("send", {
                  blockchain,
                  token,
                  to: {
                    address: inputContent,
                  },
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
    return <></>;
  }

  return (
    <div style={{ padding: 10 }}>
      <div style={{ color: theme.custom.colors.fontColor, marginBottom: 8 }}>
        Users who haven't yet set a primary address
      </div>
      <ListItem
        button
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
            count={allResults.length}
            members={allResults.map((x) => ({
              image: x.remoteUserImage,
              username: x.remoteUsername,
            }))}
          />
        </div>
      </ListItem>
    </div>
  );
}

function MembersList({
  count,
  members,
}: {
  count: number;
  members: { image: string; username: string }[];
}) {
  const theme = useCustomTheme();
  const MEMBER_TRHESHOLD = 3;
  const classes = useStyles();
  const renderMembersStr = () => {
    if (members.length <= MEMBER_TRHESHOLD) {
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
  const classes = useStyles();
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
      {filteredContacts.length !== 0 && (
        <div style={{ margin: "12px 12px" }}>
          <div className={classes.title} style={{ marginLeft: 2 }}>
            Contacts
          </div>
          <div>
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
          </div>
        </div>
      )}
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
  const classes = useStyles();
  const wallets = useAllWallets().filter((x) => x.blockchain === blockchain);
  const { uuid } = useUser();
  const avatarUrl = useAvatarUrl();
  const activeSolWallet = useActiveSolanaWallet();
  const activeEthWallet = useActiveEthereumWallet();
  if (wallets.length === 1) {
    // Only one wallet available
    return <></>;
  }

  return (
    <div style={{ margin: "12px 12px" }}>
      <div className={classes.title} style={{ marginLeft: 2 }}>
        Your addresses
      </div>
      <AddressList
        wallets={wallets
          .filter(
            (x) =>
              x.publicKey !==
                (blockchain === Blockchain.SOLANA
                  ? activeSolWallet.publicKey
                  : activeEthWallet.publicKey) &&
              x.publicKey.includes(searchFilter)
          )
          .map((wallet) => ({
            username: wallet.name,
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
    image: string;
    addresses: string[];
    uuid: string;
  }[];
}) {
  const theme = useCustomTheme();

  return (
    <List
      style={{
        paddingTop: 0,
        paddingBottom: 0,
        borderRadius: "14px",
        border: `${theme.custom.colors.borderFull}`,
      }}
    >
      {wallets
        .filter((wallet) => wallet.addresses?.[0])
        .map((wallet, index) => (
          <>
            <AddressListItem
              key={wallet.username}
              isFirst={index === 0}
              isLast={index === wallets.length - 1}
              user={{
                username: wallet.username,
                image: wallet.image,
                uuid: wallet.uuid,
              }}
              address={wallet.addresses?.[0]}
            />
          </>
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
    image: string;
    uuid: string;
  };
  address?: string;
  isFirst: boolean;
  isLast: boolean;
}) => {
  const theme = useCustomTheme();
  const classes = useStyles();
  const { push } = useNavigation();
  const { blockchain, token } = useAddressSelectorContext();

  return (
    <ListItem
      button
      disableRipple
      onClick={() => {
        if (!address) {
          return;
        }
        push("send", {
          blockchain,
          token,
          to: {
            address: address,
            username: user.username,
            image: user.image,
            uuid: user.uuid,
          },
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
          <div className={classes.userText}>{user.username}</div>
          {!address && (
            <BlockIcon style={{ color: "#E33E3F", marginLeft: 10 }} />
          )}
          {/*<div className={classes.address}>{walletAddressDisplay(address)}</div>*/}
        </div>
      </div>
    </ListItem>
  );
};

const SearchAddress = ({
  inputContent,
  setInputContent,
  blockchain,
  searchResults,
  setSearchResults,
}: {
  inputContent: string;
  setInputContent: any;
  blockchain: Blockchain;
  searchResults: any[];
  setSearchResults: any;
}) => {
  const { provider: solanaProvider } = useAnchorContext();
  const ethereumCtx = useEthereumCtx();
  const [loading, setLoading] = useState(false);
  const theme = useCustomTheme();

  const { isErrorAddress } = useIsValidAddress(
    blockchain,
    inputContent,
    solanaProvider.connection,
    ethereumCtx.provider
  );

  const fetchUserDetails = async (address: string) => {
    setLoading(true);
    try {
      const response = await ParentCommunicationManager.getInstance().fetch(
        `${BACKEND_API_URL}/users?usernamePrefix=${address}&limit=6`
      );
      const json = await response.json();
      setLoading(false);
      setSearchResults(
        json.users.sort((a: any, b: any) =>
          a.username.length < b.username.length ? -1 : 1
        ) || []
      );
    } catch (e) {
      console.error(e);
    }
  };

  const debouncedFetchUserDetails = (prefix: string) => {
    clearTimeout(debouncedTimer);
    debouncedTimer = setTimeout(() => {
      fetchUserDetails(prefix);
    }, 250);
  };

  useEffect(() => {
    if (inputContent.length >= 2) {
      debouncedFetchUserDetails(inputContent);
    }
  }, [inputContent]);

  return (
    <div style={{ margin: "0 12px" }}>
      <TextInput
        placeholder={`Search by name or address`}
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
        }}
        margin="none"
      />
      {searchResults.length !== 0 && (
        <div style={{ marginTop: 10 }}>
          <AddressList
            wallets={searchResults.map((user) => ({
              username: user.username,
              image: user.image,
              uuid: user.id,
              addresses: user.public_keys?.map((x: any) => x.publicKey),
            }))}
          />
        </div>
      )}
    </div>
  );
};

import React, { useContext, useEffect, useState } from "react";
import type { RemoteUserData } from "@coral-xyz/common";
import {
  BACKEND_API_URL,
  Blockchain,
  walletAddressDisplay,
} from "@coral-xyz/common";
import { useContacts } from "@coral-xyz/db";
import { ParentCommunicationManager, UserList } from "@coral-xyz/message-sdk";
import {
  isFirstLastListItemStyle,
  PrimaryButton,
  TextInput,
  UserIcon,
} from "@coral-xyz/react-common";
import type { TokenData } from "@coral-xyz/recoil";
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  List,
  ListItem,
} from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import { createStyles, makeStyles } from "@mui/styles";

import {
  useNavigation,
  useNavigation as useNavigationEphemeral,
} from "../../../common/Layout/NavStack";

import { useIsValidAddress } from "./Send";
import { TokenBadge } from "./TokenBadge";

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
  token: TokenData;
};

const AddressSelectorContext =
  React.createContext<AddressSelectorContext | null>(null);
export function AddressSelectorProvider(props: {
  blockchain: Blockchain;
  token: TokenData;
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
  token: TokenData;
}) => {
  const classes = useStyles();
  const nav = useNavigationEphemeral();
  const [inputContent, setInputContent] = useState("");
  const { provider: solanaProvider } = useAnchorContext();
  const ethereumCtx = useEthereumCtx();
  const { push } = useNavigation();
  const { isValidAddress } = useIsValidAddress(
    blockchain,
    inputContent,
    solanaProvider.connection,
    ethereumCtx.provider
  );

  const isSendDisabled = !isValidAddress;

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
        </div>
        <div className={classes.buttonContainer}>
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
            disabled={isSendDisabled}
            label="Next"
            type="submit"
            data-testid="Send"
          />
        </div>
      </div>
    </AddressSelectorProvider>
  );
};

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

  const filteredContacts = contacts.filter((x) => {
    if (x.remoteUsername.includes(searchFilter)) {
      return true;
    }
    if (x.public_keys.find((x) => x.public_key.includes(searchFilter))) {
      return true;
    }
    return false;
  });

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
                      (x.public_key.includes(searchFilter) ||
                        c.remoteUsername.includes(searchFilter))
                  )
                  .map((x) => x.public_key),
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
      {wallets.map((wallet, index) => (
        <>
          {wallet.addresses?.length === 1 ? (
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
          ) : (
            <AddressListItems
              key={wallet.username}
              isFirst={index === 0}
              isLast={index === wallets.length - 1}
              user={{
                username: wallet.username,
                image: wallet.image,
                uuid: wallet.uuid,
              }}
              addresses={wallet.addresses}
            />
          )}
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
  address: string;
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
        <div>
          <div className={classes.userText}>{user.username}</div>
          {/*<div className={classes.address}>{walletAddressDisplay(address)}</div>*/}
        </div>
      </div>
    </ListItem>
  );
};

function AddressListItems({
  user,
  addresses,
  isFirst,
  isLast,
}: {
  user: {
    username: string;
    image: string;
    uuid: string;
  };
  addresses: string[];
  isFirst: boolean;
  isLast: boolean;
}) {
  const theme = useCustomTheme();
  const classes = useStyles();
  const { push } = useNavigation();
  const { blockchain, token } = useAddressSelectorContext();

  return (
    <Accordion
      sx={{
        backgroundColor: theme.custom.colors.nav,
        root: {
          "&$expanded": {
            margin: "auto",
          },
          "&.MuiAccordionSummary-root": {
            backgroundColor: theme.custom.colors.nav,
            padding: 0,
          },
          borderBottom: isLast
            ? undefined
            : `solid 1pt ${theme.custom.colors.border}`,
          ...isFirstLastListItemStyle(isFirst, isLast, 12),
        },
        expanded: {},
      }}
      disableGutters={true}
      elevation={0}
    >
      <AccordionSummary
        sx={{
          backgroundColor: theme.custom.colors.nav,
        }}
        expandIcon={<></>}
        aria-controls="panel1a-content"
        id="panel1a-header"
        className={classes.hoverParent}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              background: theme.custom.colors.nav,
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
              <div
                style={{ marginLeft: 30 }}
                className={`${classes.hoverChild} ${classes.userText}`}
              >
                {addresses?.length} addresses
              </div>
              {/*<div className={classes.address}>*/}
              {/*  {addresses.length === 0*/}
              {/*    ? `No addresses on the ${blockchain} blockchain`*/}
              {/*    : "Multiple addresses"}*/}
              {/*</div>*/}
            </div>
          </div>
          <div>
            <div className={classes.hoverChild}>
              <ExpandMoreIcon
                style={{ color: theme.custom.colors.fontColor }}
              ></ExpandMoreIcon>
            </div>
          </div>
        </div>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          color: theme.custom.colors.fontColor,
          cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {addresses?.map((address) => (
            <div style={{ padding: "2px 4px" }}>
              <TokenBadge
                onClick={() => {
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
                label={walletAddressDisplay(address)}
              />
            </div>
          ))}
        </div>
      </AccordionDetails>
    </Accordion>
  );
}

const SearchAddress = ({
  inputContent,
  setInputContent,
  blockchain,
}: {
  inputContent: string;
  setInputContent: any;
  blockchain: Blockchain;
}) => {
  const { provider: solanaProvider } = useAnchorContext();
  const ethereumCtx = useEthereumCtx();
  const [loading, setLoading] = useState(false);
  const theme = useCustomTheme();
  const [searchResults, setSearchResults] = useState<RemoteUserData[]>([]);

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
        `${BACKEND_API_URL}/users?usernamePrefix=${address}&limit=5`
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
      {!isErrorAddress && inputContent && (
        <div style={{ color: "#52D24C", marginTop: 5, marginLeft: 2 }}>
          This is a valid {blockchain} address
        </div>
      )}
      {isErrorAddress && inputContent && inputContent.length > 15 && (
        <div style={{ color: "#FF6269", marginTop: 5, marginLeft: 2 }}>
          This is not a valid {blockchain} address
        </div>
      )}
      {searchResults.length !== 0 && (
        <div style={{ marginTop: 10 }}>
          {" "}
          <AddressList
            wallets={searchResults.map((user) => ({
              username: user.username,
              image: user.image,
              uuid: user.id,
              addresses: user.public_keys?.map((x: any) => x.public_key),
            }))}
          />
        </div>
      )}
    </div>
  );
};

import React, { useContext, useEffect, useState } from "react";
import {
  Blockchain,
  NAV_COMPONENT_MESSAGE_PROFILE,
  walletAddressDisplay,
} from "@coral-xyz/common";
import { useContacts, useUsers } from "@coral-xyz/db";
import {
  isFirstLastListItemStyle,
  LocalImage,
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
import { List, ListItem } from "@mui/material";
import { createStyles, makeStyles } from "@mui/styles";

import { useNavStack } from "../../../common/Layout/NavStack";

import { Send, useIsValidAddress } from "./Send";

const useStyles = makeStyles((theme: any) =>
  createStyles({
    title: {
      fontColor: theme.custom.colors.fontColor,
    },
    userText: {
      fontSize: 16,
      marginTop: 4,
      color: theme.custom.colors.fontColor2,
    },
    address: {
      fontWeight: 500,
      fontSize: 14,
      color: "#99A4B4",
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
  const { title, setTitle } = useNavStack();
  const [inputContent, setInputContent] = useState("");

  useEffect(() => {
    const prev = title;
    setTitle(`Send ${token?.ticker}`);
    return () => {
      setTitle(prev);
    };
  }, []);

  return (
    <AddressSelectorProvider blockchain={blockchain} token={token}>
      <SearchAddress
        inputContent={inputContent}
        setInputContent={setInputContent}
        blockchain={blockchain}
      />
      <YourAddresses blockchain={blockchain} />
      <Contacts />
    </AddressSelectorProvider>
  );
};

const Contacts = () => {
  const classes = useStyles();
  const { uuid } = useUser();
  const contacts = useContacts(uuid);

  return (
    <div style={{ margin: "12px 12px" }}>
      <div className={classes.title} style={{ marginLeft: 2 }}>
        Contacts
      </div>
      <div>
        <AddressList
          wallets={contacts.map((c) => ({
            username: c.remoteUsername,
            address: "",
            image: c.remoteUserImage,
          }))}
        />
      </div>
    </div>
  );
};

const YourAddresses = ({ blockchain }: { blockchain: Blockchain }) => {
  const classes = useStyles();
  const wallets = useAllWallets().filter((x) => x.blockchain === blockchain);
  const { username } = useUser();
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
                : activeEthWallet.publicKey)
          )
          .map((wallet) => ({
            username: wallet.name,
            image: avatarUrl,
            address: wallet.publicKey,
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
    address: string;
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
        <AddressListItem
          key={wallet.address}
          isFirst={index === 0}
          isLast={index === wallets.length - 1}
          user={{ username: wallet.username, image: wallet.image }}
          address={wallet.address}
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
    image: string;
  };
  address: string;
  isFirst: boolean;
  isLast: boolean;
}) => {
  const theme = useCustomTheme();
  const classes = useStyles();
  const { push } = useNavStack();
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
          },
        });
      }}
      style={{
        paddingLeft: "12px",
        paddingRight: "12px",
        paddingTop: "8px",
        paddingBottom: "8px",
        display: "flex",
        height: "68px",
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
          <UserIcon image={user.image} />
        </div>
        <div>
          <div className={classes.userText}>{user.username}</div>
          <div className={classes.address}>{walletAddressDisplay(address)}</div>
        </div>
      </div>
    </ListItem>
  );
};

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
  const { isErrorAddress } = useIsValidAddress(
    blockchain,
    inputContent,
    solanaProvider.connection,
    ethereumCtx.provider
  );

  return (
    <div style={{ margin: "0 12px" }}>
      <TextInput
        placeholder={`Enter address`}
        value={inputContent}
        setValue={(e) => setInputContent(e.target.value.trim())}
        error={isErrorAddress}
        inputProps={{
          name: "to",
          spellCheck: "false",
        }}
        margin="none"
      />
    </div>
  );
};

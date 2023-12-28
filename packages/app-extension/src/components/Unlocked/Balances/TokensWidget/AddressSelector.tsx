import { createContext, useContext, useEffect, useState } from "react";
import { Blockchain } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import {
  DangerButton,
  HardwareWalletIcon,
  PrimaryButton,
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
import {
  BpInput,
  IncognitoAvatar,
  StyledText,
  useTheme,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";
import BlockIcon from "@mui/icons-material/Block";
import { ListItemButton } from "@mui/material";
import { createStyles, makeStyles } from "@mui/styles";

import {
  useNavigation,
  useNavigation as useNavigationEphemeral,
} from "../../../common/Layout/NavStack";

export interface SendData {
  address: string;
  username?: string;
  image?: string;
  uuid?: string;
  walletName?: string;
}

const useStyles = makeStyles(() =>
  createStyles({
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

const AddressSelectorContext = createContext<AddressSelectorContext | null>(
  null
);

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
  assetId,
  publicKey,
  blockchain,
  address,
}: {
  assetId: string;
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

  // if (!token) return null;

  return (
    <AddressSelector
      blockchain={blockchain}
      name={token?.ticker ?? ""}
      onSelect={(sendData) => {
        push("send", {
          blockchain,
          token: {
            id: assetId,
            ...token,
          },
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
          token: {
            id: props.assetId,
            ...props.token,
          },
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
  const { t } = useTranslation();
  const classes = useStyles();
  const nav = useNavigationEphemeral();
  const [inputContent, setInputContent] = useState("");
  const { provider: solanaProvider } = useAnchorContext();
  const ethereumCtx = useEthereumCtx();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const { isValidAddress, isErrorAddress, normalizedAddress } =
    useIsValidAddress(
      blockchain,
      inputContent,
      solanaProvider.connection,
      ethereumCtx.provider
    );

  useEffect(() => {
    const prev = nav.title;
    nav.setOptions({
      headerTitle: t("send_ticker", { ticker: name }),
    });
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
      <YStack space="$3" minHeight="100%">
        <YStack paddingHorizontal="$4">
          <SearchInput
            searchResults={searchResults}
            inputContent={inputContent}
            setInputContent={setInputContent}
            setSearchResults={setSearchResults}
          />
        </YStack>
        <YStack flex={1}>
          {!inputContent ? (
            <YourAddresses
              searchFilter={inputContent}
              blockchain={blockchain}
            />
          ) : null}
        </YStack>
        <div className={classes.buttonContainer}>
          {isErrorAddress || (!isValidAddress && inputContent.length > 15) ? (
            <DangerButton label={t("invalid_address")} disabled />
          ) : (
            <PrimaryButton
              onClick={() => {
                const user = searchResults.find((x) =>
                  x.public_keys.find(
                    (result: any) => result.publicKey === inputContent
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
              label={t("next")}
              type="submit"
              data-testid="Send"
            />
          )}
        </div>
      </YStack>
    </AddressSelectorProvider>
  );
};

const YourAddresses = ({
  blockchain,
  searchFilter,
}: {
  blockchain: Blockchain;
  searchFilter: string;
}) => {
  const theme = useTheme();
  const wallets = useAllWallets().filter((x) => x.blockchain === blockchain);
  const { uuid, username } = useUser();
  const avatarUrl = useAvatarUrl();
  const activeSolWallet = useActiveSolanaWallet();
  const activeEthWallet = useActiveEthereumWallet();
  const { t } = useTranslation();
  const renderWallets = wallets
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
      uuid: uuid,
      addresses: [wallet.publicKey],
    }));

  return (
    <YStack flex={1} space="$3">
      <YStack paddingHorizontal="$4">
        <StyledText fontSize="$xs" color="$baseTextMedEmphasis">
          {t("your_addresses")}
        </StyledText>
      </YStack>
      {renderWallets.length >= 1 ? (
        <AddressList wallets={renderWallets} />
      ) : (
        <YStack
          alignItems="center"
          justifyContent="center"
          backgroundColor="$baseBackgroundL1"
          borderRadius={12}
          gap="$8"
          paddingVertical="$8"
          marginHorizontal="$4"
        >
          <HardwareWalletIcon
            fill={theme.baseIcon.val}
            height={42}
            width={42}
          />
          <StyledText color="$baseTextHighEmphasis">
            {t("no_other_addresses")}
          </StyledText>
        </YStack>
      )}
    </YStack>
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
    <YStack>
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
    </YStack>
  );
}

const AddressListItem = ({
  user,
  address,
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
  // const theme = useTheme();
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
        padding: "0",
      }}
    >
      <XStack
        height="48px"
        padding="$3"
        width="100%"
        hoverStyle={{
          backgroundColor: "$baseBackgroundL2",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <IncognitoAvatar
            marginRight="$3"
            size={32}
            fontSize={16}
            uuid={user.uuid}
          />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <StyledText>{user.walletName || user.username}</StyledText>
          {!address ? (
            <BlockIcon style={{ color: "#E33E3F", marginLeft: 10 }} />
          ) : null}
        </div>
      </XStack>
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
  const { t } = useTranslation();

  useEffect(() => {
    if (!inputContent && searchResults.length) {
      setSearchResults([]);
    }
  }, [searchResults, inputContent]);

  return (
    <BpInput
      autoFocus
      placeholder={t("enter_username_or_address")}
      value={inputContent}
      onChangeText={(text) => setInputContent(text.trim())}
    />
  );
};

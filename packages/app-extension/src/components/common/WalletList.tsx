/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import {
  formatTitleCase,
  formatWalletAddress,
  UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
} from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import {
  HardwareIcon,
  MnemonicIcon,
  ProxyImage,
  SecretKeyIcon,
} from "@coral-xyz/react-common";
import {
  enabledBlockchainConfigsAtom,
  enabledBlockchainsAtom,
  getBlockchainLogo,
  useActiveWallet,
  useAllWallets,
  useBackgroundClient,
} from "@coral-xyz/recoil";
import {
  Button,
  StyledText,
  temporarilyMakeStylesForBrowserExtension,
  Text,
  Theme,
  useTheme,
  View,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";
import {
  Add,
  Check,
  ContentCopy,
  ExpandMore,
  MoreHoriz,
} from "@mui/icons-material";
import InfoIcon from "@mui/icons-material/Info";
import {
  Box,
  Button as MuiButton,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { useRecoilValue } from "recoil";

import { useDrawerContext, WithMiniDrawer } from "../common/Layout/Drawer";
import {
  NavStackEphemeral,
  NavStackScreen,
  useNavigation,
} from "../common/Layout/NavStack";
import { NetworkListItem } from "../Onboarding/pages/BlockchainSelector";
import { AddConnectWalletMenu } from "../Unlocked/Settings/AddConnectWallet";
import {
  CreateMnemonic,
  CreateOrImportMnemonic,
} from "../Unlocked/Settings/AddConnectWallet/CreateMnemonic";
import { ImportMenu } from "../Unlocked/Settings/AddConnectWallet/ImportMenu";
import {
  ImportMnemonic,
  ImportMnemonicAutomatic,
} from "../Unlocked/Settings/AddConnectWallet/ImportMnemonic";
import { ImportSecretKey } from "../Unlocked/Settings/AddConnectWallet/ImportSecretKey";
import { RemoveWallet } from "../Unlocked/Settings/YourAccount/EditWallets/RemoveWallet";
import { RenameWallet } from "../Unlocked/Settings/YourAccount/EditWallets/RenameWallet";
import { WalletDetail } from "../Unlocked/Settings/YourAccount/EditWallets/WalletDetail";
import {
  ShowPrivateKey,
  ShowPrivateKeyWarning,
} from "../Unlocked/Settings/YourAccount/ShowPrivateKey";

import { Scrollbar } from "./Layout/Scrollbar";
import { WithCopyTooltip } from "./WithCopyTooltip";

const useStyles = temporarilyMakeStylesForBrowserExtension((theme) => ({
  addressButton: {
    padding: 0,
    color: theme.custom.colors.secondary,
    textTransform: "none",
    fontWeight: 500,
    lineHeight: "24px",
    fontSize: "14px",
    "&:hover": {
      backgroundColor: "transparent",
      "& svg": {
        visibility: "visible",
      },
    },
  },
}));

export function WalletDrawerButton({
  wallet,
  style,
  buttonStyle,
  showIcon = true,
}: {
  wallet: { name: string; publicKey: string };
  style?: React.CSSProperties;
  buttonStyle?: React.CSSProperties;
  showIcon?: boolean;
}) {
  const { setOpen } = useWalletDrawerContext();
  return (
    <WalletButton
      wallet={wallet as any}
      onClick={(e: any) => {
        e.stopPropagation();
        setOpen(true);
      }}
      style={style}
      buttonStyle={buttonStyle}
      showIcon={showIcon}
    />
  );
}

function WalletButton({
  wallet,
  onClick,
  style,
  buttonStyle,
  showIcon = true,
}: {
  wallet: { name: string; publicKey: string; blockchain: Blockchain };
  onClick: (e: any) => void;
  style?: React.CSSProperties;
  buttonStyle?: React.CSSProperties;
  showIcon?: boolean;
}) {
  const classes = useStyles();
  const theme = useTheme();
  const iconUrl = getBlockchainLogo(wallet.blockchain);
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        justifyContent: "space-between",
        ...style,
      }}
    >
      <MuiButton
        disableRipple
        className={classes.addressButton}
        style={{
          backgroundColor: theme.baseBackgroundL1.val,
          borderRadius: "16px",
          border: `solid 1px ${theme.baseBorderMed.val}`,
          ...buttonStyle,
        }}
      >
        <div
          style={{
            display: "flex",
            padding: "5px",
          }}
          onClick={onClick}
        >
          {showIcon ? (
            <div
              style={{
                width: "15px",
                marginLeft: "6px",
                marginRight: "6px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              {" "}
              <ProxyImage
                noSkeleton
                src={iconUrl}
                style={{
                  width: "15px",
                }}
              />
            </div>
          ) : null}
          <div
            style={{
              marginRight: "2px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: theme.baseTextHighEmphasis.val,
              }}
            >
              {wallet.name}
            </Typography>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <ExpandMore
              style={{
                width: "18px",
                color: theme.baseIcon.val,
              }}
            />
          </div>
        </div>
        <CopyButtonHeader />
      </MuiButton>
    </div>
  );
}

//TODO:
// - change padding from whole section to left and right sections to fix click bug on far right padding
function CopyButtonHeader() {
  const theme = useTheme();
  const wallet = useActiveWallet();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const formattedWalletAddr = `${wallet.publicKey
    .toString()
    .slice(0, 4)}...${wallet.publicKey
    .toString()
    .slice(wallet.publicKey.toString().length - 4)}`;
  return (
    <WithCopyTooltip title={formattedWalletAddr} tooltipOpen={tooltipOpen}>
      <div
        style={{
          borderLeft: theme.baseBorderMed.val,
          borderLeftWidth: "1px",
          borderLeftStyle: "solid",
          paddingLeft: "6px",
          paddingRight: "6px",
        }}
        onClick={async (e) => {
          e.preventDefault();
          e.stopPropagation();

          setTooltipOpen(true);
          await navigator.clipboard.writeText(wallet.publicKey);
          setTimeout(() => setTooltipOpen(false), 3000);
        }}
      >
        <IconButton
          disableRipple
          sx={{
            width: "24px",
            padding: "5px",
            "&:hover": {
              background: "transparent",
            },
          }}
          size="large"
        >
          {tooltipOpen ? (
            <Check
              style={{
                color: theme.baseIcon.val,
                backgroundColor: "transparent",
                width: "16px",
              }}
            />
          ) : (
            <ContentCopy
              style={{
                color: theme.baseIcon.val,
                backgroundColor: "transparent",
                width: "16px",
              }}
            />
          )}
        </IconButton>
      </div>
    </WithCopyTooltip>
  );
}

export function WalletDrawerNavStack({
  openDrawer,
  setOpenDrawer,
  filter,
}: {
  openDrawer: boolean;
  setOpenDrawer: (b: boolean) => void;
  filter?: (w: {
    blockchain: Blockchain;
    publicKey: string;
    name: string;
  }) => boolean;
}) {
  const theme = useTheme();
  return (
    <WithMiniDrawer
      openDrawer={openDrawer}
      setOpenDrawer={setOpenDrawer}
      paperProps={{
        sx: {
          height: "90%",
          background: theme.baseBackgroundL0.val,
        },
      }}
    >
      <div
        style={{
          height: "100%",
          background: theme.baseBackgroundL0.val,
        }}
      >
        <Scrollbar>
          <WalletNavStack filter={filter} />
        </Scrollbar>
      </div>
    </WithMiniDrawer>
  );
}

function WalletNavStack({
  filter,
}: {
  filter?: (w: {
    blockchain: Blockchain;
    publicKey: string;
    name: string;
  }) => boolean;
}) {
  return (
    <NavStackEphemeral
      initialRoute={{ name: "root" }}
      options={() => ({ title: "" })}
    >
      <NavStackScreen
        name="root"
        component={(props: any) => (
          <AllWalletsList filter={filter} {...props} />
        )}
      />
      <NavStackScreen
        name="add-connect-wallet"
        component={(props: any) => <AddConnectWalletMenu {...props} />}
      />
      <NavStackScreen
        name="edit-wallets-wallet-detail"
        component={(props: any) => <WalletDetail {...props} />}
      />
      <NavStackScreen
        name="edit-wallets-remove"
        component={(props: any) => <RemoveWallet {...props} />}
      />
      <NavStackScreen
        name="edit-wallets-rename"
        component={(props: any) => <RenameWallet {...props} />}
      />
      <NavStackScreen
        name="edit-wallets-blockchain-selector"
        component={(props: any) => <WalletListBlockchainSelector {...props} />}
      />
      <NavStackScreen
        name="create-or-import-mnemonic"
        component={(props: any) => <CreateOrImportMnemonic {...props} />}
      />
      <NavStackScreen
        name="set-and-sync-mnemonic"
        component={(props: any) => <ImportMnemonicAutomatic {...props} />}
      />
      <NavStackScreen
        name="import-wallet"
        component={(props: any) => <ImportMenu {...props} />}
      />
      <NavStackScreen
        name="create-mnemonic"
        component={(props: any) => <CreateMnemonic {...props} />}
      />

      <NavStackScreen
        name="import-from-mnemonic"
        component={(props: any) => <ImportMnemonic {...props} />}
      />
      <NavStackScreen
        name="import-from-secret-key"
        component={(props: any) => <ImportSecretKey {...props} />}
      />
      <NavStackScreen
        name="show-private-key-warning"
        component={(props: any) => <ShowPrivateKeyWarning {...props} />}
      />
      <NavStackScreen
        name="show-private-key"
        component={(props: any) => <ShowPrivateKey {...props} />}
      />
    </NavStackEphemeral>
  );
}

export function AllWalletsList({ filter }: { filter?: (w: any) => boolean }) {
  const theme = useTheme();
  const nav = useNavigation();
  const activeWallet = useActiveWallet();
  const enabledBlockchains = useRecoilValue(enabledBlockchainsAtom);
  const { t } = useTranslation();
  const [blockchainFilter, setBlockchainFilter] = useState(
    activeWallet.blockchain
  );
  const wallets = useAllWallets()
    .filter(
      (w) =>
        enabledBlockchains.includes(w.blockchain) &&
        w.blockchain === blockchainFilter
    )
    .filter(filter ? filter : () => true);

  useEffect(() => {
    nav.setOptions({
      headerTitle: t("wallets"),
      headerRight: <WalletSettingsButton />,
    });
    return () => {
      nav.setOptions({ headerRight: null });
    };
  }, []);

  const add = () => {
    nav.push("add-connect-wallet", {
      blockchain: blockchainFilter,
    });
  };

  return (
    <YStack flex={1} space="$3">
      <BlockchainFilter
        filter={blockchainFilter}
        setFilter={setBlockchainFilter}
      />
      <YStack>
        <_WalletList activeWallet={activeWallet} wallets={wallets} />
        <div
          onClick={add}
          style={{
            marginTop: "24px",
            marginBottom: "24px",
            textAlign: "center",
          }}
        >
          <Text
            color="$accentBlue"
            textAlign="center"
            fontWeight="600"
            hoverStyle={{
              cursor: "pointer",
              opacity: 0.8,
            }}
          >
            Add
          </Text>
        </div>
      </YStack>
    </YStack>
  );
}

function BlockchainFilter({
  filter,
  setFilter,
}: {
  filter: Blockchain;
  setFilter: (f: Blockchain) => void;
}) {
  const enabledBlockchains = useRecoilValue(enabledBlockchainsAtom);
  return (
    <XStack display="flex" paddingHorizontal="$4" space="$3">
      {enabledBlockchains.map((blockchain: Blockchain) => (
        <BlockchainPill
          key={blockchain}
          isSelected={filter === blockchain}
          blockchain={blockchain}
          onClick={() => setFilter(blockchain)}
        />
      ))}
    </XStack>
  );
}

function BlockchainPill({
  isSelected,
  blockchain,
  onClick,
}: {
  isSelected: boolean;
  blockchain: Blockchain;
  onClick: () => void;
}) {
  isSelected;
  const theme = useTheme();
  return (
    <Button
      flex={0}
      borderRadius={20}
      alignItems="center"
      paddingHorizontal="$3"
      paddingVertical={17}
      justifyContent="center"
      outlineWidth={0}
      borderWidth={0}
      backgroundColor={
        isSelected ? theme.invertedBaseBackgroundL0 : theme.baseBackgroundL1
      }
      color={
        isSelected
          ? theme.invertedBaseTextHighEmphasis
          : theme.baseTextHighEmphasis
      }
      hoverStyle={{
        outlineWidth: 0,
        opacity: 0.8,
        backgroundColor: isSelected
          ? theme.invertedBaseBackgroundL0
          : theme.baseBackgroundL1,
      }}
      focusStyle={{
        outlineWidth: 0,
        // opacity: 0.8,
        // borderWidth: 2,
        // borderColor: isSelected
        //   ? theme.baseBorderFocus
        //   : theme.baseBorderMed,
        backgroundColor: isSelected
          ? theme.invertedBaseBackgroundL0
          : theme.baseBackgroundL1,
      }}
      pressStyle={{
        outlineWidth: 0,
        opacity: 0.7,
        // borderWidth: 2,
        borderColor: isSelected ? theme.baseBorderFocus : theme.baseBorderLight,
        // backgroundColor: isSelected
        //   ? theme.invertedBaseBackgroundL0
        //   : theme.baseBackgroundL1,
      }}
      onPress={onClick}
    >
      <NetworkIcon
        blockchain={blockchain}
        style={{
          maxWidth: "16px",
        }}
      />
      <StyledText
        fontSize="$sm"
        color={
          isSelected
            ? theme.invertedBaseTextHighEmphasis
            : theme.baseTextHighEmphasis
        }
      >
        {formatTitleCase(blockchain)}
      </StyledText>
    </Button>
  );
}

function WalletSettingsButton() {
  const theme = useTheme();
  const { push } = useNavigation();
  return (
    <YStack
      onPress={() => {
        push("edit-wallets-blockchain-selector");
      }}
      cursor="pointer"
    >
      <Add
        style={{
          color: theme.baseIcon.val,
        }}
      />
    </YStack>
  );
}

export function WalletListBlockchainSelector() {
  const nav = useNavigation();
  const { t } = useTranslation();
  const enabledBlockchainConfigs = useRecoilValue(enabledBlockchainConfigsAtom);

  useEffect(() => {
    nav.setOptions({ headerTitle: t("select_network") });
  }, [nav]);

  const onClick = (blockchain: Blockchain) => {
    nav.push("add-connect-wallet", {
      blockchain,
    });
  };

  return (
    <Box style={{ padding: "0 16px 16px", marginTop: 12 }}>
      <div>
        {Object.entries(enabledBlockchainConfigs).map(([blockchain]) => {
          return (
            <>
              <NetworkListItem
                blockchain={blockchain as Blockchain}
                selectedBlockchains={[]}
                onClick={() => onClick(blockchain as Blockchain)}
              />
              {/* Spacing */}
              <View height={16} />
            </>
          );
        })}
      </div>
    </Box>
  );
}

function _WalletList({
  activeWallet,
  wallets,
}: {
  activeWallet: any;
  wallets: any;
}) {
  const { close } = useDrawerContext();
  const background = useBackgroundClient();
  const theme = useTheme();

  const onChange = async (w: {
    publicKey: string;
    blockchain: string;
    name: string;
    type: string;
  }) => {
    // ph101pp todo
    background
      .request({
        method: UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
        params: [w.publicKey.toString(), w.blockchain],
      })
      // use set timeout here to avoid rerender race condition.. (not optimal)
      .then(() => setTimeout(() => close(), 100))
      .catch((e) => {
        console.log(e);
      });
  };

  return (
    <>
      <YStack paddingHorizontal="$4" flex={1}>
        {wallets.length === 0 ? (
          <div
            style={{
              backgroundColor: theme.baseBackgroundL1.val,
              padding: "16px",
              borderRadius: "10px",
            }}
          >
            <Typography
              style={{
                color: theme.baseIcon.val,
                textAlign: "center",
                fontWeight: 500,
              }}
            >
              No active wallets found
            </Typography>
          </div>
        ) : (
          <WalletList
            wallets={wallets}
            clickWallet={async (wallet) => {
              if (wallet.type !== "dehydrated") {
                await onChange(wallet);
              }
            }}
            selectedWalletPublicKey={activeWallet.publicKey}
          />
        )}
      </YStack>
    </>
  );
}

function ColdWalletList({ children }: { children: JSX.Element }) {
  const theme = useTheme();
  // const oldTheme = useTheme();

  return (
    <YStack backgroundColor="$baseBackgroundL0" padding="$4">
      <XStack marginBottom="$2">
        <Typography
          style={{
            fontWeight: 500,
            color: theme.baseTextHighEmphasis.val,
            fontSize: "14px",
            lineHeight: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          Disabled app signing
        </Typography>
        <Tooltip
          placement="bottom"
          arrow
          title={"These wallets can't sign for apps."}
          componentsProps={{
            tooltip: {
              sx: {
                width: "250px",
                fontSize: "14px",
                bgcolor: theme.invertedBaseBackgroundL0.val,
                color: theme.invertedBaseTextHighEmphasis.val,
                "& .MuiTooltip-arrow": {
                  color: theme.invertedBaseTextHighEmphasis.val,
                },
              },
            },
          }}
        >
          <InfoIcon
            style={{
              width: "16px",
              marginLeft: "5px",
              color: theme.invertedBaseTextHighEmphasis.val,
            }}
          />
        </Tooltip>
      </XStack>
      {children}
    </YStack>
  );
}

function WalletList({
  wallets,
  clickWallet,
  selectedWalletPublicKey,
}: {
  wallets: Array<{
    name: string;
    publicKey: string;
    type: string;
    blockchain: Blockchain;
    isCold?: boolean;
  }>;
  clickWallet: (w: {
    name: string;
    publicKey: string;
    type: string;
    blockchain: Blockchain;
  }) => void;
  selectedWalletPublicKey?: string;
}) {
  const theme = useTheme();
  const nav = useNavigation();

  return (
    <YStack space="$2">
      {wallets.map(
        (wallet: {
          name: string;
          publicKey: string;
          type: string;
          blockchain: Blockchain;
          isCold?: boolean;
        }) => {
          const isSelected =
            // false &&
            selectedWalletPublicKey !== undefined &&
            selectedWalletPublicKey === wallet.publicKey.toString();
          return (
            <XStack
              onPress={() => {
                clickWallet(wallet);
              }}
              cursor="pointer"
              justifyContent="center"
              paddingVertical={12}
              paddingHorizontal="$3"
              space="$3"
              key={wallet.publicKey}
              borderRadius="$medium"
              backgroundColor="$baseBackgroundL1"
              borderWidth="2px"
              borderColor={isSelected ? "$accentBlue" : "transparent"}
              hoverStyle={{
                opacity: 0.8,
              }}
            >
              <YStack justifyContent="center" alignItems="center" width={19}>
                <NetworkIcon
                  blockchain={wallet.blockchain}
                  style={{
                    maxWidth: "19px",
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                />
              </YStack>
              <YStack flexGrow={1}>
                <StyledText fontWeight="$medium">{wallet.name}</StyledText>
                <XStack alignItems="center" space="$1">
                  <WalletTypeIcon
                    type={wallet.type}
                    fill={theme.baseIcon.val}
                  />
                  <StyledText fontSize="$sm" color="$baseTextMedEmphasis">
                    {formatWalletAddress(wallet.publicKey)}
                  </StyledText>
                </XStack>
              </YStack>
              <XStack space="$2" alignItems="center" flexShrink={0} flex={0}>
                <CopyButton
                  inverted={false}
                  onClick={async () => {
                    await navigator.clipboard.writeText(wallet.publicKey);
                  }}
                />
                <EditWalletsButton
                  inverted={false}
                  onClick={() => {
                    nav.push("edit-wallets-wallet-detail", {
                      ...wallet,
                    });
                  }}
                />
              </XStack>
            </XStack>
          );
        }
      )}
    </YStack>
  );
}

function CopyButton({ onClick }: { onClick: () => void; inverted?: boolean }) {
  const [isCopying, setIsCopying] = useState(false);
  const { t } = useTranslation();

  return (
    <Button
      backgroundColor="$baseBackgroundL2"
      borderRadius="$2"
      color="$baseTextHighEmphasis"
      paddingVertical="$3.5"
      paddingHorizontal="$2.5"
      borderWidth={0}
      fontSize="$sm"
      fontWeight="$semiBold"
      focusStyle={{
        backgroundColor: "$baseBackgroundL2",
        outlineWidth: 0,
      }}
      hoverStyle={{
        backgroundColor: "$baseBackgroundL2",
        opacity: 0.8,
        outlineWidth: 0,
      }}
      pressStyle={{
        backgroundColor: "$baseBackgroundL2",
        opacity: 0.7,
        outlineWidth: 0,
      }}
      outlineWidth={0}
      onPress={(e: any) => {
        e.stopPropagation();
        setIsCopying(true);
        setTimeout(() => setIsCopying(false), 1000);
        onClick();
      }}
    >
      {isCopying ? t("copied") : t("copy")}
    </Button>
  );
}

function EditWalletsButton({
  onClick,
}: {
  onClick: () => void;
  inverted?: boolean;
}) {
  const theme = useTheme();
  return (
    <Button
      backgroundColor="$baseBackgroundL2"
      borderRadius="$2"
      color="$baseTextHighEmphasis"
      paddingVertical="$3.5"
      paddingHorizontal="$2"
      borderWidth={0}
      fontSize="$sm"
      fontWeight="$semiBold"
      focusStyle={{
        backgroundColor: "$baseBackgroundL2",
        outlineWidth: 0,
      }}
      hoverStyle={{
        backgroundColor: "$baseBackgroundL2",
        opacity: 0.8,
        outlineWidth: 0,
      }}
      pressStyle={{
        backgroundColor: "$baseBackgroundL2",
        opacity: 0.7,
        outlineWidth: 0,
      }}
      outlineWidth={0}
      onPress={(e: any) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <MoreHoriz
        style={{
          color: theme.baseIcon.val,
        }}
      />
    </Button>
  );
}

function WalletTypeIcon({ type, fill }: { type: string; fill?: string }) {
  const style = { padding: "5px" };
  switch (type) {
    case "imported":
      return <SecretKeyIcon fill={fill} style={style} />;
    case "hardware":
      return <HardwareIcon fill={fill} style={style} />;
    case "derived":
      return <MnemonicIcon fill={fill} style={style} />;
    default:
      return null;
  }
}

export function ImportTypeBadge({ type }: { type: string }) {
  const theme = useTheme();
  return type === "derived" ? (
    <></>
  ) : (
    <div
      style={{
        paddingLeft: "10px",
        paddingRight: "10px",
        paddingTop: "2px",
        paddingBottom: "2px",
        backgroundColor: theme.baseBackgroundL1.val,
        height: "20px",
        borderRadius: "10px",
      }}
    >
      <Typography
        style={{
          color: theme.baseTextHighEmphasis.val,
          fontSize: "12px",
          lineHeight: "16px",
          fontWeight: 600,
        }}
      >
        {type === "imported" ? "IMPORTED" : "HARDWARE"}
      </Typography>
    </div>
  );
}

function NetworkIcon({
  blockchain,
  style,
}: {
  blockchain: Blockchain;
  style?: React.CSSProperties;
}) {
  const blockchainLogo = getBlockchainLogo(blockchain);
  return <img src={blockchainLogo} style={style} />;
}

type WalletDrawerContext = {
  open: boolean;
  setOpen: any;
};

const _WalletDrawerContext = React.createContext<WalletDrawerContext | null>(
  null
);

export function WalletDrawerProvider({ children }: any) {
  const [open, setOpen] = useState(false);
  return (
    <_WalletDrawerContext.Provider
      value={{
        open,
        setOpen,
      }}
    >
      <>
        {children}
        <WalletDrawerNavStack openDrawer={open} setOpenDrawer={setOpen} />
      </>
    </_WalletDrawerContext.Provider>
  );
}

function useWalletDrawerContext(): WalletDrawerContext {
  const ctx = useContext(_WalletDrawerContext);
  if (ctx === null) {
    throw new Error("Context not available");
  }
  return ctx;
}

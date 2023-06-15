/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from "react";
import {
  Blockchain,
  formatWalletAddress,
  UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
} from "@coral-xyz/common";
import {
  HardwareIcon,
  List,
  ListItem,
  MnemonicIcon,
  ProxyImage,
  SecretKeyIcon,
} from "@coral-xyz/react-common";
import {
  getBlockchainLogo,
  useActiveWallet,
  useAllWallets,
  useBackgroundClient,
  useDehydratedWallets,
  usePrimaryWallets,
} from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { Add, ExpandMore, MoreHoriz } from "@mui/icons-material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import InfoIcon from "@mui/icons-material/Info";
import { Box, Button, Grid, Tooltip, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

import {
  EthereumIconOnboarding as EthereumIcon,
  SolanaIconOnboarding as SolanaIcon,
} from "../common/Icon";
import { ActionCard } from "../common/Layout/ActionCard";
import { useDrawerContext, WithMiniDrawer } from "../common/Layout/Drawer";
import {
  NavStackEphemeral,
  NavStackScreen,
  useNavigation,
} from "../common/Layout/NavStack";
import {
  AddConnectPreview,
  AddConnectWalletMenu,
} from "../Unlocked/Settings/AddConnectWallet";
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

const useStyles = styles((theme) => ({
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
  const theme = useCustomTheme();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const iconUrl = getBlockchainLogo(wallet.blockchain);

  const onCopy = async () => {
    setTooltipOpen(true);
    setTimeout(() => setTooltipOpen(false), 1000);
    await navigator.clipboard.writeText(wallet.publicKey.toString());
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        justifyContent: "space-between",
        //        marginLeft: "8px",
        ...style,
      }}
    >
      <Button
        disableRipple
        className={classes.addressButton}
        onClick={onClick}
        style={{
          border: theme.custom.colors.borderFull,
          background: theme.custom.colors.nav,
          padding: "5px",
          paddingLeft: "8px",
          borderRadius: "30px",
          ...buttonStyle,
        }}
      >
        {showIcon ? (
          <div
            style={{
              width: "15px",
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
        <Typography
          style={{
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          {wallet.name}
        </Typography>
        <ExpandMore
          style={{
            width: "18px",
            color: theme.custom.colors.icon,
          }}
        />
      </Button>
      {/*
      <WithCopyTooltip tooltipOpen={tooltipOpen}>
        <Button
          disableRipple
          style={{
            display: "flex",
            padding: 0,
            minWidth: "16px",
          }}
          className={classes.addressButton}
          onClick={async (e) => {
            e.stopPropagation();
            await onCopy();
          }}
        >
          <ContentCopyIcon
            style={{
              width: "16px",
            }}
          />
        </Button>
      </WithCopyTooltip>
			*/}
    </div>
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
  const theme = useCustomTheme();
  return (
    <WithMiniDrawer
      openDrawer={openDrawer}
      setOpenDrawer={setOpenDrawer}
      paperProps={{
        sx: {
          height: "90%",
          background: theme.custom.colors.backgroundBackdrop,
        },
      }}
      backdropProps={{
        style: {
          opacity: 0.8,
          background: "#18181b",
        },
      }}
    >
      <div
        style={{
          height: "100%",
          background: theme.custom.colors.backgroundBackdrop,
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
        name="edit-wallets-add-connect-preview"
        component={(props: any) => <AddConnectPreview {...props} />}
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
  const nav = useNavigation();
  const activeWallet = useActiveWallet();
  const wallets = useAllWallets().filter(filter ? filter : () => true);
  const activeWallets = wallets.filter((w) => !w.isCold);
  const coldWallets = wallets.filter((w) => w.isCold);

  // Dehydrated public keys are keys that exist on the server but cannot be
  // used on the client as we don't have signing data, e.g. mnemonic, private
  // key or ledger derivation path
  const dehydratedWallets = useDehydratedWallets().map((w: any) => ({
    ...w,
    name: "", // TODO server side does not sync wallet names
    type: "dehydrated",
  }));

  useEffect(() => {
    nav.setOptions({
      headerTitle: "Wallets",
      headerRight: <WalletSettingsButton />,
    });
    return () => {
      nav.setOptions({ headerRight: null });
    };
  }, []);

  return (
    <_WalletList
      activeWallet={activeWallet}
      activeWallets={activeWallets.concat(dehydratedWallets)}
      coldWallets={coldWallets}
    />
  );
}

function WalletSettingsButton() {
  const theme = useCustomTheme();
  const { push } = useNavigation();
  return (
    <Button
      onClick={() => {
        push("edit-wallets-add-connect-preview");
      }}
      disableElevation
      disableRipple
      style={{
        minWidth: "24px",
        width: "24px",
        height: "24px",
      }}
    >
      <Add
        style={{
          color: theme.custom.colors.icon,
        }}
      />
    </Button>
  );
}

export function WalletListBlockchainSelector() {
  const nav = useNavigation();
  useEffect(() => {
    nav.setOptions({ headerTitle: "Select a network" });
  }, [nav]);

  const onClick = (blockchain: Blockchain) => {
    nav.push("add-connect-wallet", {
      blockchain,
    });
  };

  return (
    <Box style={{ padding: "0 16px 16px", marginTop: 12 }}>
      <Grid container spacing={1.5}>
        <Grid item xs={6}>
          <ActionCard
            icon={<EthereumIcon />}
            text="Ethereum"
            onClick={() => onClick(Blockchain.ETHEREUM)}
          />
        </Grid>
        <Grid item xs={6}>
          <ActionCard
            icon={<SolanaIcon />}
            text="Solana"
            onClick={() => onClick(Blockchain.SOLANA)}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

function _WalletList({
  activeWallet,
  activeWallets,
  coldWallets,
}: {
  activeWallet: any;
  activeWallets: any;
  coldWallets: any;
}) {
  const { close } = useDrawerContext();
  const background = useBackgroundClient();
  const theme = useCustomTheme();

  const onChange = async (w: {
    publicKey: string;
    blockchain: string;
    name: string;
    type: string;
  }) => {
    await background.request({
      method: UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
      params: [w.publicKey.toString(), w.blockchain],
    });
  };

  return (
    <div
      style={{
        paddingTop: 0,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div
        style={{
          padding: "16px",
          paddingTop: "0px",
          flex: 1,
        }}
      >
        {activeWallets.length === 0 ? (
          <div
            style={{
              backgroundColor: theme.custom.colors.nav,
              padding: "16px",
              borderRadius: "10px",
            }}
          >
            <Typography
              style={{
                color: theme.custom.colors.icon,
                textAlign: "center",
                fontWeight: 500,
              }}
            >
              No active wallets found
            </Typography>
          </div>
        ) : (
          <WalletList
            wallets={activeWallets}
            clickWallet={async (wallet) => {
              if (wallet.type !== "dehydrated") {
                await onChange(wallet);
                close();
              }
            }}
            style={{
              borderRadius: "10px",
              overflow: "hidden",
              marginLeft: 0,
              marginRight: 0,
            }}
            selectedWalletPublicKey={activeWallet.publicKey}
          />
        )}
      </div>
      {coldWallets.length > 0 ? (
        <div
          style={{
            background: theme.custom.colorsInverted.background,
            padding: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                marginBottom: "12px",
                display: "flex",
              }}
            >
              <Typography
                style={{
                  fontWeight: 500,
                  color: theme.custom.colorsInverted.fontColor,
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
                      bgcolor: theme.custom.colorsInverted.copyTooltipColor,
                      color: theme.custom.colorsInverted.copyTooltipTextColor,
                      "& .MuiTooltip-arrow": {
                        color: theme.custom.colorsInverted.copyTooltipColor,
                      },
                    },
                  },
                }}
              >
                <InfoIcon
                  style={{
                    width: "16px",
                    marginLeft: "5px",
                    color: theme.custom.colorsInverted.secondary,
                  }}
                />
              </Tooltip>
            </div>
          </div>
          <WalletList
            inverted
            wallets={coldWallets}
            clickWallet={async (wallet) => {
              if (wallet.type !== "dehydrated") {
                await onChange(wallet);
                close();
              }
            }}
            style={{
              borderRadius: "10px",
              overflow: "hidden",
              marginLeft: 0,
              marginRight: 0,
            }}
            selectedWalletPublicKey={activeWallet.publicKey}
          />
        </div>
      ) : null}
    </div>
  );
}

function WalletList({
  wallets,
  clickWallet,
  style,
  selectedWalletPublicKey,
  inverted,
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
  style: React.CSSProperties;
  selectedWalletPublicKey?: string;
  inverted?: boolean;
}) {
  return (
    <List style={style} inverted={inverted}>
      {wallets.map(
        (
          wallet: {
            name: string;
            publicKey: string;
            type: string;
            blockchain: Blockchain;
            isCold?: boolean;
          },
          idx: number
        ) => {
          const isFirst = idx === 0;
          const isLast = idx === wallets.length - 1;
          // TODO: isSelected styling.
          const isSelected =
            false &&
            selectedWalletPublicKey !== undefined &&
            selectedWalletPublicKey === wallet.publicKey.toString();
          return (
            <WalletListItem
              inverted={inverted}
              key={idx}
              wallet={wallet}
              isSelected={isSelected}
              isFirst={isFirst}
              isLast={isLast}
              onClick={clickWallet}
            />
          );
        }
      )}
    </List>
  );
}

function WalletListItem({
  wallet,
  isSelected,
  isFirst,
  isLast,
  onClick,
  inverted,
}: {
  wallet: {
    name: string;
    publicKey: string;
    type: string;
    blockchain: Blockchain;
    isCold?: boolean;
  };
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  onClick: (wallet: {
    name: string;
    publicKey: string;
    type: string;
    blockchain: Blockchain;
  }) => void;
  inverted?: boolean;
}) {
  const primaryWallets = usePrimaryWallets();
  const isPrimary = primaryWallets.find((x) => x.publicKey === wallet.publicKey)
    ? true
    : false;
  const theme = useCustomTheme();
  const nav = useNavigation();
  const { publicKey, name, blockchain, type } = wallet;
  return (
    <ListItem
      inverted={inverted}
      key={publicKey.toString()}
      onClick={() => onClick(wallet)}
      isFirst={isFirst}
      isLast={isLast}
      disableBottomBorder
      style={{
        padding: "12px",
        height: "72px",
        marginBottom: isLast ? 0 : "8px",
        borderRadius: "10px",
        border: isSelected
          ? `solid 2px ${
              inverted
                ? theme.custom.colorsInverted.secondary
                : theme.custom.colors.secondary
            }`
          : type === "dehydrated"
          ? `solid 2px ${theme.custom.colors.borderRedMed}`
          : isPrimary
          ? `solid 2px linear-gradient(129.99deg, #3EECB8 0%, #A372FE 50%, #FE7D4A 100%), linear-gradient(0deg, #FFFFFF, #FFFFFF)`
          : "none",
      }}
      button={type !== "dehydrated"}
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
            display: "flex",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              width: "32px",
              height: "100%",
              marginRight: "8px",
            }}
          >
            <NetworkIcon
              blockchain={blockchain}
              style={{
                maxWidth: "19px",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              marginRight: "4px",
            }}
          >
            <StackedWalletAddress
              name={name}
              publicKey={publicKey}
              type={type}
              isSelected={isSelected}
              inverted={inverted}
              isPrimary={isPrimary}
            />
          </div>
        </div>
        <div
          style={{
            display: "flex",
          }}
        >
          <div
            style={{
              marginRight: "4px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {type === "dehydrated" ? (
              <RecoverButton
                inverted={inverted}
                onClick={() => {
                  nav.push("add-connect-wallet", {
                    blockchain: wallet.blockchain,
                    publicKey: wallet.publicKey,
                    isRecovery: true,
                  });
                }}
              />
            ) : (
              <CopyButton
                inverted={inverted}
                onClick={async () => {
                  await navigator.clipboard.writeText(publicKey);
                }}
              />
            )}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <EditWalletsButton
              inverted={inverted}
              onClick={() => {
                nav.push("edit-wallets-wallet-detail", {
                  ...wallet,
                });
              }}
            />
          </div>
        </div>
      </div>
    </ListItem>
  );
}

function WalletListButtonBase({
  onClick,
  inverted,
  sx,
  children,
}: {
  onClick: (e: any) => void;
  inverted?: boolean;
  sx?: SxProps<Theme>;
  children: React.ReactElement;
}) {
  const theme = useCustomTheme();
  return (
    <Button
      disableElevation
      disableRipple
      variant="contained"
      sx={{
        padding: "4px 12px",
        textTransform: "none",
        color: inverted
          ? theme.custom.colorsInverted.fontColor
          : theme.custom.colors.fontColor,
        backgroundColor: inverted
          ? theme.custom.colorsInverted.bg2
          : theme.custom.colors.bg2,
        "&:hover": {
          backgroundColor: inverted
            ? `${theme.custom.colorsInverted.walletCopyButtonHover} !important`
            : `${theme.custom.colors.walletCopyButtonHover} !important`,
        },
        ...sx,
      }}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function CopyButton({
  onClick,
  inverted,
}: {
  onClick: () => void;
  inverted?: boolean;
}) {
  const [isCopying, setIsCopying] = useState(false);
  return (
    <WalletListButtonBase
      onClick={(e: any) => {
        e.stopPropagation();
        setIsCopying(true);
        setTimeout(() => setIsCopying(false), 1000);
        onClick();
      }}
      inverted={inverted}
    >
      <>{isCopying ? "Copied!" : "Copy"}</>
    </WalletListButtonBase>
  );
}

function EditWalletsButton({
  onClick,
  inverted,
}: {
  onClick: () => void;
  inverted?: boolean;
}) {
  const theme = useCustomTheme();
  return (
    <WalletListButtonBase
      onClick={(e: any) => {
        e.stopPropagation();
        onClick();
      }}
      inverted={inverted}
      sx={{
        padding: "4px",
        minWidth: "32px",
      }}
    >
      <MoreHoriz
        style={{
          color: theme.custom.colors.icon,
        }}
      />
    </WalletListButtonBase>
  );
}

function RecoverButton({
  onClick,
  inverted,
}: {
  onClick: () => void;
  inverted?: boolean;
}) {
  return (
    <WalletListButtonBase
      onClick={(e: any) => {
        e.stopPropagation();
        onClick();
      }}
      inverted={inverted}
    >
      <>Recover</>
    </WalletListButtonBase>
  );
}

function StackedWalletAddress({
  publicKey,
  name,
  type,
  isSelected = false,
  inverted,
  isPrimary,
}: {
  publicKey: string;
  name: string;
  type: string;
  isSelected?: boolean;
  inverted?: boolean;
  isPrimary?: boolean;
}) {
  const theme = useCustomTheme();
  return (
    <div>
      <div style={{ display: "flex" }}>
        <Typography
          style={{
            fontSize: "16px",
            fontWeight: isSelected ? 600 : 500,
            color: type === "dehydrated" ? theme.custom.colors.negative : "",
          }}
        >
          {type === "dehydrated" ? "Not recovered" : name}
        </Typography>
        {type !== "dehydrated" && isPrimary ? (
          <Typography
            style={{
              marginLeft: "4px",
              fontSize: "14px",
              fontWeight: 500,
              color: inverted
                ? theme.custom.colorsInverted.secondary
                : theme.custom.colors.secondary,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            (primary)
          </Typography>
        ) : null}
      </div>
      <div
        style={{
          display: "flex",
          height: "24px",
        }}
      >
        <WalletTypeIcon
          type={type}
          fill={
            inverted
              ? isSelected
                ? theme.custom.colorsInverted.secondary
                : undefined
              : isSelected
              ? theme.custom.colors.secondary
              : undefined
          }
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography
            style={{
              color: inverted
                ? theme.custom.colorsInverted.secondary
                : theme.custom.colors.secondary,
              fontSize: "14px",
            }}
          >
            {formatWalletAddress(publicKey)}
          </Typography>
        </div>
      </div>
    </div>
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
  const theme = useCustomTheme();
  return type === "derived" ? (
    <></>
  ) : (
    <div
      style={{
        paddingLeft: "10px",
        paddingRight: "10px",
        paddingTop: "2px",
        paddingBottom: "2px",
        backgroundColor: theme.custom.colors.bg2,
        height: "20px",
        borderRadius: "10px",
      }}
    >
      <Typography
        style={{
          color: theme.custom.colors.fontColor,
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

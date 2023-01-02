import { useEffect, useState } from "react";
import {
  Blockchain,
  UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
  walletAddressDisplay,
} from "@coral-xyz/common";
import { List, ListItem } from "@coral-xyz/react-common";
import {
  useAllWallets,
  useBackgroundClient,
  useBlockchainActiveWallet,
  useBlockchainLogo,
} from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { ExpandMore, Settings } from "@mui/icons-material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Button, Typography } from "@mui/material";

import { useDrawerContext, WithMiniDrawer } from "../common/Layout/Drawer";
import {
  NavStackEphemeral,
  NavStackScreen,
  useNavStack,
} from "../common/Layout/NavStack";
import { ImportSecretKey } from "../Unlocked/Settings";
import { AddConnectWalletMenu } from "../Unlocked/Settings/AddConnectWallet";
import { EditWallets } from "../Unlocked/Settings/YourAccount/EditWallets";
import { RemoveWallet } from "../Unlocked/Settings/YourAccount/EditWallets/RemoveWallet";
import { RenameWallet } from "../Unlocked/Settings/YourAccount/EditWallets/RenameWallet";
import { WalletDetail } from "../Unlocked/Settings/YourAccount/EditWallets/WalletDetail";

import { Scrollbar } from "./Layout/Scrollbar";
import { HardwareIcon, ImportedIcon, MnemonicIcon } from "./Icon";
import { WithCopyTooltip } from "./WithCopyTooltip";

const useStyles = styles((theme) => ({
  addressButton: {
    padding: 0,
    color: theme.custom.colors.secondary,
    textTransform: "none",
    fontWeight: 500,
    lineHeight: "24px",
    fontSize: "14px",
    marginLeft: "8px",
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
}: {
  wallet: { name: string; publicKey: string };
}) {
  const [openDrawer, setOpenDrawer] = useState(false);

  return (
    <>
      <WalletButton
        wallet={wallet}
        onClick={(e: any) => {
          e.stopPropagation();
          setOpenDrawer(true);
        }}
      />
      <WalletDrawerNavStack
        openDrawer={openDrawer}
        setOpenDrawer={setOpenDrawer}
      />
    </>
  );
}

function WalletButton({
  wallet,
  onClick,
}: {
  wallet: { name: string; publicKey: string };
  onClick: (e: any) => void;
}) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const onCopy = () => {
    setTooltipOpen(true);
    setTimeout(() => setTooltipOpen(false), 1000);
    navigator.clipboard.writeText(wallet.publicKey.toString());
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <Button disableRipple className={classes.addressButton} onClick={onClick}>
        {wallet.name}
        <ExpandMore
          style={{
            width: "18px",
            color: theme.custom.colors.icon,
          }}
        />
      </Button>
      <WithCopyTooltip tooltipOpen={tooltipOpen}>
        <Button
          disableRipple
          style={{
            display: "flex",
            padding: 0,
            minWidth: "16px",
          }}
          className={classes.addressButton}
          onClick={(e) => {
            e.stopPropagation();
            onCopy();
          }}
        >
          <ContentCopyIcon
            style={{
              width: "16px",
            }}
          />
        </Button>
      </WithCopyTooltip>
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
        name={"root"}
        component={(props: any) => (
          <AllWalletsList filter={filter} {...props} />
        )}
      />
      <NavStackScreen
        name={"edit-wallets"}
        component={(props: any) => <EditWallets filter={filter} {...props} />}
      />
      <NavStackScreen
        name={"edit-wallets-wallet-detail"}
        component={(props: any) => <WalletDetail {...props} />}
      />
      <NavStackScreen
        name={"edit-wallets-remove"}
        component={(props: any) => <RemoveWallet {...props} />}
      />
      <NavStackScreen
        name={"edit-wallets-rename"}
        component={(props: any) => <RenameWallet {...props} />}
      />
      <NavStackScreen
        name={"add-connect-wallet"}
        component={(props: any) => <AddConnectWalletMenu {...props} />}
      />
      <NavStackScreen
        name={"import-secret-key"}
        component={(props: any) => <ImportSecretKey {...props} />}
      />
    </NavStackEphemeral>
  );
}

function AllWalletsList({ filter }: { filter?: (w: any) => boolean }) {
  const { setTitle, setNavButtonRight } = useNavStack();
  const activeWallet = useBlockchainActiveWallet(Blockchain.SOLANA);
  let wallets = useAllWallets();

  useEffect(() => {
    setNavButtonRight(<WalletSettingsButton />);
    setTitle("Wallets");
    return () => {
      setNavButtonRight(null);
    };
  }, []);

  if (filter) {
    wallets = wallets.filter(filter);
  }
  return <_WalletList activeWallet={activeWallet} wallets={wallets} />;
}

function WalletSettingsButton() {
  const theme = useCustomTheme();
  const { push } = useNavStack();
  return (
    <Button
      onClick={() => {
        push("edit-wallets");
      }}
      disableElevation
      disableRipple
      style={{
        minWidth: "24px",
        width: "24px",
        height: "24px",
      }}
    >
      <Settings
        style={{
          color: theme.custom.colors.icon,
        }}
      />
    </Button>
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
        padding: "16px",
        paddingTop: 0,
        //background: theme.custom.colors.backgroundBackdrop,
      }}
    >
      <WalletList
        wallets={wallets}
        clickWallet={(v) => {
          onChange(v);
          close();
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
  );
}

export function WalletList({
  wallets,
  clickWallet,
  style,
  selectedWalletPublicKey,
}: {
  wallets: Array<{
    name: string;
    publicKey: string;
    type: string;
    blockchain: Blockchain;
  }>;
  clickWallet: (w: {
    name: string;
    publicKey: string;
    type: string;
    blockchain: Blockchain;
  }) => void;
  style: React.CSSProperties;
  selectedWalletPublicKey?: string;
}) {
  const theme = useCustomTheme();
  return (
    <List style={style}>
      {wallets.map(
        (
          wallet: {
            name: string;
            publicKey: string;
            type: string;
            blockchain: Blockchain;
          },
          idx: number
        ) => {
          const { name, publicKey, type, blockchain } = wallet;
          const isFirst = idx === 0;
          const isLast = idx === wallets.length - 1;
          // TODO: isSelected styling.
          const isSelected =
            false &&
            selectedWalletPublicKey !== undefined &&
            selectedWalletPublicKey === publicKey.toString();
          return (
            <ListItem
              key={publicKey.toString()}
              onClick={() => clickWallet(wallet)}
              isFirst={isFirst}
              isLast={isLast}
              disableBottomBorder={true}
              style={{
                padding: "12px",
                height: "72px",
                marginBottom: isLast ? 0 : "8px",
                borderRadius: "10px",
                border: isSelected
                  ? `solid 2px ${theme.custom.colors.secondary}`
                  : "none",
              }}
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
                    />
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <CopyButton
                    onClick={() => {
                      navigator.clipboard.writeText(publicKey);
                    }}
                  />
                </div>
              </div>
            </ListItem>
          );
        }
      )}
    </List>
  );
}

function CopyButton({ onClick }: { onClick: () => void }) {
  const [isCopying, setIsCopying] = useState(false);
  const theme = useCustomTheme();
  return (
    <Button
      disableElevation
      disableRipple
      variant="contained"
      style={{
        width: "60px",
        height: "32px",
        padding: 0,
        textTransform: "none",
        color: theme.custom.colors.fontColor,
        backgroundColor: theme.custom.colors.bg2,
      }}
      onClick={(e) => {
        e.stopPropagation();
        setIsCopying(true);
        setTimeout(() => setIsCopying(false), 1000);
        onClick();
      }}
    >
      {isCopying ? "Copied!" : "Copy"}
    </Button>
  );
}

export function StackedWalletAddress({
  publicKey,
  name,
  type,
  isSelected = false,
}: {
  publicKey: string;
  name: string;
  type: string;
  isSelected?: boolean;
}) {
  const theme = useCustomTheme();
  return (
    <div>
      <Typography
        style={{
          fontSize: "16px",
          fontWeight: isSelected ? 600 : 500,
        }}
      >
        {name}
      </Typography>
      <div
        style={{
          display: "flex",
          height: "24px",
        }}
      >
        <WalletTypeIcon
          type={type}
          fill={isSelected ? theme.custom.colors.secondary : undefined}
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
              color: theme.custom.colors.secondary,
              fontSize: "14px",
            }}
          >
            {walletAddressDisplay(publicKey)}
          </Typography>
        </div>
      </div>
    </div>
  );
}

function WalletTypeIcon({ type, fill }: { type: string; fill?: string }) {
  switch (type) {
    case "imported":
      return <ImportedIcon fill={fill} />;
    case "hardware":
      return <HardwareIcon fill={fill} />;
    default:
      return <MnemonicIcon fill={fill} />;
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
  const blockchainLogo = useBlockchainLogo(blockchain);
  return <img src={blockchainLogo} style={style} />;
}

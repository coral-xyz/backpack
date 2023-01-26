import { useEffect, useState } from "react";
import {
  Blockchain,
  UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
  walletAddressDisplay,
} from "@coral-xyz/common";
import { List, ListItem } from "@coral-xyz/react-common";
import {
  useActiveWallet,
  useAllWallets,
  useBackgroundClient,
  useBlockchainLogo,
  useDehydratedWallets,
} from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { Add, ExpandMore, MoreHoriz } from "@mui/icons-material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ErrorIcon from "@mui/icons-material/Error";
import { Box, Button, Grid, Typography } from "@mui/material";

import {
  EthereumIconOnboarding as EthereumIcon,
  HardwareIcon,
  ImportedIcon,
  MnemonicIcon,
  SolanaIconOnboarding as SolanaIcon,
} from "../common/Icon";
import { ActionCard } from "../common/Layout/ActionCard";
import { useDrawerContext, WithMiniDrawer } from "../common/Layout/Drawer";
import {
  NavStackEphemeral,
  NavStackScreen,
  useNavStack,
} from "../common/Layout/NavStack";
import {
  AddConnectPreview,
  AddConnectWalletMenu,
} from "../Unlocked/Settings/AddConnectWallet";
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
}: {
  wallet: { name: string; publicKey: string };
  style?: React.CSSProperties;
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
        style={style}
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
  style,
}: {
  wallet: { name: string; publicKey: string };
  onClick: (e: any) => void;
  style?: React.CSSProperties;
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
        marginLeft: "8px",
        ...style,
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
        name={"add-connect-wallet"}
        component={(props: any) => <AddConnectWalletMenu {...props} />}
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
        name={"edit-wallets-add-connect-preview"}
        component={(props: any) => <AddConnectPreview {...props} />}
      />
      <NavStackScreen
        name={"edit-wallets-blockchain-selector"}
        component={(props: any) => <WalletListBlockchainSelector {...props} />}
      />
      <NavStackScreen
        name={"import-secret-key"}
        component={(props: any) => <ImportSecretKey {...props} />}
      />
      <NavStackScreen
        name={"show-private-key-warning"}
        component={(props: any) => <ShowPrivateKeyWarning {...props} />}
      />
      <NavStackScreen
        name={"show-private-key"}
        component={(props: any) => <ShowPrivateKey {...props} />}
      />
    </NavStackEphemeral>
  );
}

export function AllWalletsList({ filter }: { filter?: (w: any) => boolean }) {
  const { setTitle, setNavButtonRight } = useNavStack();
  const activeWallet = useActiveWallet();
  const wallets = useAllWallets().filter(filter ? filter : () => true);
  // Dehydrated public keys are keys that exist on the server but cannot be
  // used on the client as we don't have signing data, e.g. mnemonic, private
  // key or ledger derivation path
  const dehydratedWallets = useDehydratedWallets().map((w: any) => ({
    ...w,
    name: "", // TODO server side does not sync wallet names
    type: "dehydrated",
  }));

  useEffect(() => {
    setNavButtonRight(<WalletSettingsButton />);
    setTitle("Wallets");
    return () => {
      setNavButtonRight(null);
    };
  }, []);

  return (
    <_WalletList
      activeWallet={activeWallet}
      wallets={wallets.concat(dehydratedWallets)}
    />
  );
}

function WalletSettingsButton() {
  const theme = useCustomTheme();
  const { push } = useNavStack();
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
  const nav = useNavStack();
  useEffect(() => {
    nav.setTitle("Blockchains");
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
            text={`Ethereum`}
            onClick={() => onClick(Blockchain.ETHEREUM)}
          />
        </Grid>
        <Grid item xs={6}>
          <ActionCard
            icon={<SolanaIcon />}
            text={`Solana`}
            onClick={() => onClick(Blockchain.SOLANA)}
          />
        </Grid>
      </Grid>
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
      }}
    >
      <WalletList
        wallets={wallets}
        clickWallet={(wallet) => {
          if (wallet.type !== "dehydrated") {
            onChange(wallet);
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
}) {
  console.log("ARMANI HERE WALLETS", wallets);
  return (
    <List style={style}>
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

export function WalletListItem({
  wallet,
  isSelected,
  isFirst,
  isLast,
  onClick,
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
}) {
  const theme = useCustomTheme();
  const nav = useNavStack();
  const { publicKey, name, blockchain, type, isCold } = wallet;
  return (
    <ListItem
      key={publicKey.toString()}
      onClick={() => onClick(wallet)}
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
              isCold={isCold}
              isSelected={isSelected}
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
            <CopyButton
              isEditWallets={false}
              onClick={() => {
                navigator.clipboard.writeText(publicKey);
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <CopyButton
              isEditWallets={true}
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

function CopyButton({
  onClick,
  isEditWallets,
}: {
  onClick: () => void;
  isEditWallets: boolean;
}) {
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
      {isEditWallets ? (
        <MoreHoriz
          style={{
            color: theme.custom.colors.icon,
          }}
        />
      ) : (
        <>{isCopying ? "Copied!" : "Copy"}</>
      )}
    </Button>
  );
}

export function StackedWalletAddress({
  publicKey,
  name,
  type,
  isCold,
  isSelected = false,
}: {
  publicKey: string;
  name: string;
  type: string;
  isCold?: boolean;
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
  const theme = useCustomTheme();
  switch (type) {
    case "imported":
      return <ImportedIcon fill={fill} />;
    case "hardware":
      return <HardwareIcon fill={fill} />;
    case "dehydrated":
      return (
        <ErrorIcon
          style={{
            color: theme.custom.colors.dangerButton,
            height: "24px",
            width: "24px",
            padding: "4px",
          }}
        />
      );
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

import type { CSSProperties } from "react";
import { Blockchain, XNFT_GG_LINK } from "@coral-xyz/common";
import {
  EmptyState,
  ProxyImage,
  useBreakpoints,
} from "@coral-xyz/react-common";
import {
  filteredPlugins,
  isAggregateWallets,
  useActiveWallet,
  useAllWalletsDisplayed,
  useLoader,
  useOpenPlugin,
  useSolanaConnectionUrl,
} from "@coral-xyz/recoil";
import { HOVER_OPACITY, styles, useCustomTheme } from "@coral-xyz/themes";
import { Block as BlockIcon } from "@mui/icons-material";
import { Button, Grid, Skeleton, Typography } from "@mui/material";
import { getSvgPath } from "figma-squircle";
import { useRecoilValue, waitForAll } from "recoil";

import {
  _BalancesTableHead,
  BalancesTableHead,
  BalancesTableProvider,
  useBalancesContext,
} from "../Balances/Balances";

const ICON_WIDTH = 64;

const squircleIconPath = getSvgPath({
  width: ICON_WIDTH,
  height: ICON_WIDTH,
  cornerRadius: 15,
  cornerSmoothing: 0.8,
});

const useStyles = styles((theme) => ({
  pluginIconRoot: {
    minWidth: ICON_WIDTH,
    marginLeft: "auto",
    marginRight: "auto",
  },
  pluginIconButton: {
    width: ICON_WIDTH,
    height: ICON_WIDTH,
    overflow: "hidden",
    clipPath: `path('${squircleIconPath}')`,
    padding: 0,
    backgroundColor: theme.custom.colors.nav,
    "&:hover": {
      opacity: HOVER_OPACITY,
    },
  },
  pluginTitle: {
    fontWeight: 500,
    color: theme.custom.colors.fontColor,
    fontSize: "12px",
    lineHeight: "16px",
    textAlign: "center",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
}));

export function Apps() {
  return <PluginGrid />;
}

function PluginGrid() {
  const _isAggregateWallets = useRecoilValue(isAggregateWallets);
  const activeWallet = useActiveWallet();
  const wallets = useAllWalletsDisplayed();
  const solanaWallets = wallets.filter(
    (wallet) => wallet.blockchain === Blockchain.SOLANA
  );
  const connectionUrl = useSolanaConnectionUrl();
  const [pluginsForAllWallets, , isLoading] = useLoader(
    waitForAll(
      solanaWallets.map((wallet) =>
        filteredPlugins({ publicKey: wallet.publicKey, connectionUrl })
      )
    ),
    [],
    [connectionUrl]
  );

  //
  // If the only displayed wallet is an Ethereum wallet, tell the user it's not supported.
  //
  if (wallets.length === 1) {
    const wallet = wallets[0];
    if (wallet.blockchain === Blockchain.ETHEREUM) {
      return (
        <EmptyState
          icon={(props: any) => <BlockIcon {...props} />}
          title="Ethereum xNFTs not yet supported"
          subtitle="Switch to Solana to use xNFTs"
          buttonText=""
          onClick={() => {}}
          header={
            // Only show the wallet switcher if we are in single wallet mode.
            !_isAggregateWallets ? (
              <_BalancesTableHead
                blockchain={wallet.blockchain}
                showContent
                setShowContent={() => {}}
              />
            ) : null
          }
        />
      );
    }
  }

  //
  // Direct the user to xNFT.gg if there are no plugins available.
  //
  const pluginCount = pluginsForAllWallets.reduce(
    (acc, walletPlugins) => walletPlugins.length + acc,
    0
  );
  if (!isLoading && pluginCount === 0) {
    return (
      <EmptyState
        icon={(props: any) => <BlockIcon {...props} />}
        title="No xNFTs"
        subtitle="Get started with your first xNFT"
        buttonText="Browse xNFTs"
        onClick={() => window.open(XNFT_GG_LINK)}
        header={
          !_isAggregateWallets ? (
            <_BalancesTableHead
              blockchain={activeWallet.blockchain}
              showContent
              setShowContent={() => {}}
            />
          ) : null
        }
      />
    );
  }

  //
  // Render all the Solana wallet xNFTs.
  //
  return (
    <>
      {solanaWallets.map((wallet: any) => {
        return <WalletXnftGrid key={wallet.publicKey} wallet={wallet} />;
      })}
    </>
  );
}

function WalletXnftGrid({
  wallet,
}: {
  wallet: { publicKey: string; name: string; blockchain: Blockchain };
}) {
  const theme = useCustomTheme();
  const connectionUrl = useSolanaConnectionUrl(); // TODO
  const [plugins, , isLoading] = useLoader(
    filteredPlugins({ publicKey: wallet.publicKey, connectionUrl }),
    [],
    [wallet]
  );

  return !isLoading && plugins.length === 0 ? null : (
    <div
      style={{
        marginLeft: "12px",
        marginRight: "12px",
        marginBottom: "12px",
        borderRadius: "10px",
        overflow: "hidden",
        border: `${theme.custom.colors.borderFull}`,
      }}
    >
      <BalancesTableProvider>
        <_WalletXnftGrid isLoading={isLoading} plugins={plugins} />
      </BalancesTableProvider>
    </div>
  );
}

function _WalletXnftGrid({
  isLoading,
  plugins,
}: {
  isLoading: boolean;
  plugins: Array<any>;
}) {
  const theme = useCustomTheme();
  const { isXs } = useBreakpoints();
  const openPlugin = useOpenPlugin();
  const { showContent } = useBalancesContext();
  const onClickPlugin = (p: any) => {
    openPlugin(p.install.account.xnft.toString());
  };
  const iconsPerRow = isXs ? 4 : 6;
  return (
    <>
      {showContent ? (
        <div
          style={{
            paddingTop: "18px",
            paddingBottom: "18px",
            paddingLeft: "10px",
            paddingRight: "10px",
            background: theme.custom.colors.nav,
            borderBottomLeftRadius: "10px",
            borderBottomRightRadius: "10px",
          }}
        >
          <Grid container>
            {isLoading ? (
              Array.from(Array(iconsPerRow).keys()).map((_, idx) => {
                return (
                  <Grid
                    item
                    key={idx}
                    xs={isXs ? 3 : 2}
                    style={{
                      marginTop: idx >= iconsPerRow ? "24px" : 0,
                    }}
                  >
                    <SkeletonAppIcon />
                  </Grid>
                );
              })
            ) : (
              <>
                <LibraryLink isXs={isXs} />
                {plugins.map((p: any, idx: number) => {
                  return (
                    <Grid
                      item
                      key={p.url}
                      xs={isXs ? 3 : 2}
                      style={{
                        marginTop: idx + 1 >= iconsPerRow ? "24px" : 0,
                      }}
                    >
                      <PluginIcon plugin={p} onClick={() => onClickPlugin(p)} />
                    </Grid>
                  );
                })}
              </>
            )}
          </Grid>
        </div>
      ) : null}
    </>
  );
}

function LibraryLink({ isXs }: { isXs: boolean }) {
  const theme = useCustomTheme();

  return (
    <Grid item key="xnft-library" xs={isXs ? 3 : 2}>
      <AppIcon
        title={"xNFT.gg \u2197"}
        iconStyle={{
          padding: 14,
          background: theme.custom.colorsInverted.nav,
        }}
        iconUrl={`${XNFT_GG_LINK}/logo.svg`}
        onClick={() => window.open(XNFT_GG_LINK, "_blank")}
      />
    </Grid>
  );
}

function PluginIcon({ plugin, onClick }: any) {
  return (
    <AppIcon title={plugin.title} iconUrl={plugin.iconUrl} onClick={onClick} />
  );
}

function AppIcon({
  title,
  iconStyle,
  iconUrl,
  onClick,
}: {
  title: string;
  iconStyle?: CSSProperties;
  iconUrl: string;
  onClick: () => void;
}) {
  const classes = useStyles();
  return (
    <div
      style={{
        width: "72px",
        height: "88px",
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <Button
        variant="contained"
        disableElevation
        className={classes.pluginIconButton}
        onClick={() => onClick()}
        classes={{
          root: classes.pluginIconRoot,
        }}
      >
        <ProxyImage
          src={iconUrl}
          style={{
            width: ICON_WIDTH,
            height: ICON_WIDTH,
            ...(iconStyle ?? {}),
          }}
        />
      </Button>
      <Typography className={classes.pluginTitle}>{title}</Typography>
    </div>
  );
}

function SkeletonAppIcon() {
  return (
    <div
      style={{
        width: "72px",
        height: "88px",
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <Skeleton
        height={ICON_WIDTH}
        width={ICON_WIDTH}
        sx={{
          transform: "none",
          clipPath: `path('${squircleIconPath}')`,
          marginLeft: "auto",
          marginRight: "auto",
          background: "rgba(0,0,0,0.15)",
        }}
      />
      <Skeleton
        height={12}
        width={48}
        sx={{
          transform: "none",
          marginLeft: "auto",
          marginRight: "auto",
          background: "rgba(0,0,0,0.15)",
        }}
      />
    </div>
  );
}

import { useState } from "react";
import { Typography } from "@mui/material";
import { Blockchain, ETH_NATIVE_MINT } from "@coral-xyz/common";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { Button } from "@coral-xyz/react-xnft-renderer";
import type { SearchParamsFor } from "@coral-xyz/recoil";
import {
  useActiveEthereumWallet,
  useBlockchainTokenAccount,
} from "@coral-xyz/recoil";
import { RecentActivityList } from "../RecentActivity";
import { WithDrawer, CloseButton } from "../../../common/Layout/Drawer";
import {
  NavStackEphemeral,
  NavStackScreen,
} from "../../../common/Layout/NavStack";
import { TransferWidget } from "../TransferWidget";

const useStyles = styles((theme) => ({
  tokenHeaderButtonContainer: {
    width: "208px",
    display: "flex",
    justifyContent: "space-between",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: "24px",
  },
  positivePercent: {
    color: theme.custom.colors.positive,
  },
  negativePercent: {
    color: theme.custom.colors.negative,
  },
  displayBalanceLabel: {
    color: theme.custom.colors.fontColor,
    fontSize: "30px",
    fontWeight: 600,
    textAlign: "center",
    lineHeight: "36px",
  },
  usdBalanceLabel: {
    color: theme.custom.colors.secondary,
    fontWeight: 500,
    fontSize: "14px",
    textAlign: "center",
    marginTop: "4px",
    lineHeight: "24px",
  },
  headerButtonLabel: {
    color: theme.custom.colors.fontColor,
    fontSize: "14px",
    lineHeight: "24px",
    fontWeight: 500,
  },
}));

export function Token({ blockchain, address }: SearchParamsFor.Token["props"]) {
  const ethereumWallet = useActiveEthereumWallet();
  // Hack: This is hit for some reason due to the framer-motion animation.
  if (!blockchain || !address) {
    return <></>;
  }

  const activityAddress =
    blockchain === Blockchain.ETHEREUM ? ethereumWallet.publicKey : address;
  const contractAddresses =
    blockchain === Blockchain.ETHEREUM ? [address] : undefined;

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TokenHeader blockchain={blockchain} address={address} />
      <RecentActivityList
        blockchain={blockchain}
        address={activityAddress}
        contractAddresses={contractAddresses}
        minimize={true}
        style={{ marginTop: 0 }}
      />
    </div>
  );
}

function TokenHeader({ blockchain, address }: SearchParamsFor.Token["props"]) {
  const classes = useStyles();
  const token = useBlockchainTokenAccount(blockchain, address);
  const percentClass =
    token.recentPercentChange > 0
      ? classes.positivePercent
      : classes.negativePercent;
  return (
    <div
      style={{
        paddingTop: "38px",
        marginBottom: "24px",
      }}
    >
      <div>
        <Typography className={classes.displayBalanceLabel}>
          {token.displayBalance.toLocaleString()} {token.ticker}
        </Typography>
        <Typography className={classes.usdBalanceLabel}>
          ${parseFloat(token.usdBalance.toFixed(2)).toLocaleString()}{" "}
          <span className={percentClass}>{token.recentPercentChange}%</span>
        </Typography>
      </div>
      <div className={classes.tokenHeaderButtonContainer}>
        <TransferWidget blockchain={blockchain} address={address} />
      </div>
    </div>
  );
}

export function WithHeaderButton({
  style,
  labelComponent,
  label,
  routes,
}: any) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const [openDrawer, setOpenDrawer] = useState(false);
  const initialRoute = routes[0];
  return (
    <>
      <Button style={style} onClick={() => setOpenDrawer(true)}>
        {labelComponent ? (
          labelComponent
        ) : (
          <Typography className={classes.headerButtonLabel}>{label}</Typography>
        )}
      </Button>
      <WithDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer}>
        <div
          style={{ height: "100%", background: theme.custom.colors.background }}
        >
          <NavStackEphemeral
            initialRoute={initialRoute}
            options={(args) => routeOptions(routes, args)}
            style={{
              borderBottom: `solid 1pt ${theme.custom.colors.border}`,
            }}
            navButtonRight={
              <CloseButton onClick={() => setOpenDrawer(false)} />
            }
          >
            {routes.map((r: any) => (
              <NavStackScreen
                key={r.name}
                name={r.name}
                component={r.component}
              />
            ))}
          </NavStackEphemeral>
        </div>
      </WithDrawer>
    </>
  );
}

function routeOptions(
  routes: Array<{ title: string; name: string }>,
  { route }: { route: { name: string; props?: any } }
) {
  const found = routes.find((r) => r.name === route.name);
  if (!found) {
    throw new Error("route not found");
  }
  return {
    title: found.title,
  };
}

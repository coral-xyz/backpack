import { useState } from "react";
import { Typography } from "@mui/material";
import { Blockchain } from "@coral-xyz/common";
import { styles } from "@coral-xyz/themes";
import { Button } from "../../../../plugin/Component";
import type { SearchParamsFor } from "@coral-xyz/recoil";
import {
  blockchainTokenData,
  useActiveEthereumWallet,
  useLoader,
} from "@coral-xyz/recoil";
import { RecentActivityList } from "../RecentActivity";
import { CloseButton, WithDrawer } from "../../../common/Layout/Drawer";
import {
  NavStackEphemeral,
  NavStackScreen,
} from "../../../common/Layout/NavStack";
import { TransferWidget } from "../TransferWidget";
import { TokenAmountHeader } from "../../../common/TokenAmountHeader";

const useStyles = styles((theme) => ({
  tokenHeaderButtonContainer: {
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

  const [token] = useLoader(blockchainTokenData({ blockchain, address }), null);

  if (!token) return <></>;

  const percentClass =
    token.recentPercentChange === undefined
      ? ""
      : token.recentPercentChange > 0
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
        <TokenAmountHeader
          token={token}
          amount={token.nativeBalance}
          displayLogo={false}
        />
        <Typography className={classes.usdBalanceLabel}>
          ${parseFloat(token.usdBalance.toFixed(2)).toLocaleString()}{" "}
          <span className={percentClass}>{token.recentPercentChange}%</span>
        </Typography>
      </div>
      <div className={classes.tokenHeaderButtonContainer}>
        <TransferWidget
          rampEnabled={
            (blockchain === Blockchain.SOLANA && token.ticker === "SOL") ||
            (blockchain === Blockchain.ETHEREUM && token.ticker === "ETH")
          }
          blockchain={blockchain}
          address={address}
        />
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
        <div style={{ height: "100%" }}>
          <NavStackEphemeral
            initialRoute={initialRoute}
            options={(args) => routeOptions(routes, args)}
            navButtonLeft={<CloseButton onClick={() => setOpenDrawer(false)} />}
            onClose={() => setOpenDrawer(false)}
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

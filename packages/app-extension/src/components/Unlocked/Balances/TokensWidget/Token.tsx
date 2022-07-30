import { useState } from "react";
import { Typography } from "@mui/material";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { Button } from "@coral-xyz/react-xnft-renderer";
import type { SearchParamsFor } from "@coral-xyz/recoil";
import { useBlockchainTokenAccount } from "@coral-xyz/recoil";
import { RecentActivityList } from "../RecentActivity";
import { WithDrawer, CloseButton } from "../../../Layout/Drawer";
import { NavStackEphemeral, NavStackScreen } from "../../../Layout/NavStack";
import { TransferWidget } from "../TransferWidget";

const useStyles = styles((theme) => ({
  tokenHeaderContainer: {
    marginBottom: "24px",
  },
  balanceContainer: {
    marginTop: "38px",
  },
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
  nativeBalanceLabel: {
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
  // Hack: This is hit for some reason due to the framer-motion animation.
  if (!blockchain || !address) {
    return <></>;
  }

  return (
    <div>
      <TokenHeader blockchain={blockchain} address={address} />
      <RecentActivityList address={address} />
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
    <div className={classes.tokenHeaderContainer}>
      <div className={classes.balanceContainer}>
        <Typography className={classes.nativeBalanceLabel}>
          {token.nativeBalance.toLocaleString()} {token.ticker}
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

import { useSuspenseQuery_experimental } from "@apollo/client";
import { formatUSD } from "@coral-xyz/common";
import { useActiveWallet } from "@coral-xyz/recoil";
import { styles as makeStyles, useCustomTheme } from "@coral-xyz/themes";
import { Skeleton, Typography } from "@mui/material";

import { gql } from "../../../graphql";

const useStyles = makeStyles(() => ({
  balancesHeaderContainer: {
    paddingLeft: "24px",
    paddingRight: "24px",
    marginTop: "24px",
    width: "100%",
    borderRadius: "12px",
    textAlign: "center",
    marginLeft: "12px",
    marginRight: "12px",
  },
  totalBalance: {
    fontWeight: 600,
    fontSize: "40px",
    lineHeight: "36px",
    color: "inherit",
  },
  percentChange: {
    paddingLeft: "8px",
    paddingRight: "8px",
    paddingTop: "2px",
    paddingBottom: "2px",
    borderRadius: "28px",
    lineHeight: "24px",
  },
  valueChange: {
    paddingLeft: "0px",
    paddingRight: "0px",
    paddingTop: "2px",
    paddingBottom: "2px",
    marginRight: "12px",
    lineHeight: "24px",
  },
}));

const GET_BALANCE_SUMMARY = gql(`
  query GetBalanceSummary($address: String!) {
    user {
      id
      wallets(filters: { pubkeys: [$address] }) {
        edges {
          node {
            id
            balances {
              id
              aggregate {
                id
                percentChange
                value
                valueChange
              }
            }
          }
        }
      }
    }
  }
`);

export function BalanceSummaryWidget() {
  const theme = useCustomTheme();
  const classes = useStyles();
  const activeWallet = useActiveWallet();

  const { data } = useSuspenseQuery_experimental(GET_BALANCE_SUMMARY, {
    variables: {
      address: activeWallet.publicKey,
    },
  });

  const aggregate = data?.user?.wallets?.edges?.[0]?.node?.balances
    ?.aggregate ?? {
    percentChange: 0,
    value: 0,
    valueChange: 0,
  };

  return (
    <div style={{ display: "flex" }}>
      <div className={classes.balancesHeaderContainer}>
        <Typography
          className={classes.totalBalance}
          style={{
            color: theme.custom.colors.fontColor,
          }}
        >
          {formatUSD(aggregate.value)}
        </Typography>
        <div
          style={{
            display: "flex",
            marginTop: "16px",
          }}
        >
          <div style={{ flex: 1 }} />
          <Typography
            className={classes.valueChange}
            style={{
              color:
                aggregate.valueChange === 0
                  ? theme.custom.colors.neutral
                  : aggregate.valueChange < 0
                  ? theme.custom.colors.negative
                  : theme.custom.colors.positive,
            }}
          >
            {aggregate.valueChange > 0 ? "+" : ""}
            {formatUSD(aggregate.valueChange)}
          </Typography>
          <Typography
            className={classes.percentChange}
            style={{
              color:
                aggregate.valueChange === 0
                  ? theme.custom.colors.neutral
                  : aggregate.valueChange < 0
                  ? theme.custom.colors.negative
                  : theme.custom.colors.positive,
              backgroundColor: !data
                ? undefined
                : aggregate.valueChange === 0
                ? theme.custom.colors.balanceChangeNeutral
                : aggregate.valueChange < 0
                ? theme.custom.colors.balanceChangeNegative
                : theme.custom.colors.balanceChangePositive,
            }}
          >
            {aggregate.valueChange > 0 ? "+" : ""}
            {Number.isFinite(aggregate.percentChange)
              ? `${aggregate.percentChange?.toFixed(2)}%`
              : "0.00%"}
          </Typography>
          <div style={{ flex: 1 }} />
        </div>
      </div>
    </div>
  );
}

export function BalanceSummaryWidgetSkeleton() {
  const theme = useCustomTheme();
  const classes = useStyles();

  return (
    <div style={{ display: "flex" }}>
      <div className={classes.balancesHeaderContainer}>
        <Typography
          className={classes.totalBalance}
          style={{
            color: theme.custom.colors.fontColor,
          }}
        >
          <Skeleton
            sx={{ backgroundColor: theme.custom.colors.balanceSkeleton }}
          />
        </Typography>
        <div
          style={{
            display: "flex",
            marginTop: "16px",
          }}
        >
          <div style={{ flex: 1 }} />
          <Typography className={classes.valueChange}>
            <Skeleton
              width="100px"
              sx={{ backgroundColor: theme.custom.colors.balanceSkeleton }}
            />
          </Typography>
          <Typography className={classes.percentChange}>
            <Skeleton
              width="100px"
              sx={{ backgroundColor: theme.custom.colors.balanceSkeleton }}
            />
          </Typography>
          <div style={{ flex: 1 }} />
        </div>
      </div>
    </div>
  );
}

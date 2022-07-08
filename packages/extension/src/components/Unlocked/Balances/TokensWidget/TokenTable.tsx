import { useState } from "react";
import { Typography, ListItem } from "@mui/material";
import { styles } from "@coral-xyz/themes";
import {
  useBalancesContext,
  BalancesTable,
  BalancesTableHead,
  BalancesTableRow,
  BalancesTableCell,
  BalancesTableContent,
} from "@coral-xyz/anchor-ui-renderer";
import {
  useBlockchainLogo,
  useBlockchainTokensSorted,
  useNavigation,
} from "@coral-xyz/recoil";
import { toTitleCase, NAV_COMPONENT_TOKEN } from "@coral-xyz/common";

const useStyles = styles((theme) => ({
  blockchainFooter: {
    borderTop: `solid 1pt ${theme.custom.colors.border}`,
    display: "flex",
    justifyContent: "space-between",
    paddingLeft: "16px",
    paddingRight: "16px",
    paddingTop: "6px",
    paddingBottom: "6px",
    height: "36px",
  },
  footerArrowIcon: {
    width: "10px",
    color: theme.custom.colors.secondary,
  },
  footerLabel: {
    fontSize: "14px",
    fontWeight: 500,
    color: theme.custom.colors.fontColor,
  },
}));

export function TokenTable() {
  const blockchain = "solana";
  const title = "Tokens";
  const limit = 3;

  const blockchainLogo = useBlockchainLogo(blockchain);
  const tokenAccountsSorted = useBlockchainTokensSorted(blockchain);
  const [showAll, setShowAll] = useState(false);
  const tokenAccountsFiltered = tokenAccountsSorted.filter(
    (t: any) => t.nativeBalance !== 0
  );

  return (
    <BalancesTable>
      <BalancesTableHead props={{ title, iconUrl: blockchainLogo }} />
      <BalancesTableContent>
        {tokenAccountsFiltered
          .slice(0, limit && !showAll ? limit : tokenAccountsSorted.length)
          .map((token: any) => (
            <TokenRow
              key={token.address}
              token={token}
              blockchain={blockchain}
            />
          ))}
      </BalancesTableContent>
      {tokenAccountsFiltered.length > 0 &&
        tokenAccountsFiltered.length > limit && (
          <BalancesTableFooter
            count={tokenAccountsFiltered.length}
            showAll={showAll}
            setShowAll={setShowAll}
          />
        )}
    </BalancesTable>
  );
}

function TokenRow({ token, blockchain }: { token: any; blockchain: string }) {
  const { push } = useNavigation();
  return (
    <BalancesTableRow
      onClick={() => {
        push({
          title: `${toTitleCase(blockchain)} / ${token.ticker}`,
          componentId: NAV_COMPONENT_TOKEN,
          componentProps: {
            blockchain,
            address: token.address,
          },
        });
      }}
    >
      <BalancesTableCell
        props={{
          icon: token.logo,
          title: token.name,
          subtitle: `${token.nativeBalance.toLocaleString()} ${token.ticker}`,
          usdValue: token.usdBalance,
          percentChange: token.recentUsdBalanceChange,
        }}
      />
    </BalancesTableRow>
  );
}

export function BalancesTableFooter({ count, showAll, setShowAll }: any) {
  const { showContent } = useBalancesContext();
  return showContent ? (
    <TokenTableFooter
      showAll={showAll}
      onClick={() => setShowAll((showAll: boolean) => !showAll)}
      count={count}
    />
  ) : (
    <></>
  );
}

function TokenTableFooter({
  showAll,
  onClick,
  count,
}: {
  showAll: boolean;
  onClick: () => void;
  count: number;
}) {
  const classes = useStyles();
  return (
    <ListItem
      button
      disableRipple
      className={classes.blockchainFooter}
      onClick={onClick}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <Typography className={classes.footerLabel}>
          {showAll ? `Hide ${count}` : `Show all ${count}`}
        </Typography>
      </div>
    </ListItem>
  );
}

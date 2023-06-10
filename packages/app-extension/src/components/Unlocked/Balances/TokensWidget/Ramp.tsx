import { useState } from "react";
import { Blockchain } from "@coral-xyz/common";
import { ProxyImage } from "@coral-xyz/react-common";
import {
  SOL_LOGO_URI,
  useAllWalletsDisplayed,
  useWalletName,
} from "@coral-xyz/recoil";
import { styles } from "@coral-xyz/themes";
import { ListItemIcon, Typography } from "@mui/material";

import { TextField } from "../../../common";
import { useNavigation } from "../../../common/Layout/NavStack";
import {
  BalancesTable,
  BalancesTableContent,
  BalancesTableHead,
  BalancesTableRow,
} from "../Balances";

const useStyles = styles((theme) => ({
  searchField: {
    marginLeft: "12px",
    marginRight: "12px",
    marginTop: "16px",
    marginBottom: "16px",
    width: "inherit",
    display: "flex",
    "& .MuiOutlinedInput-root": {
      "& input": {
        paddingTop: 0,
        paddingBottom: 0,
      },
    },
  },
  logoIcon: {
    borderRadius: "22px",
    width: "44px",
    height: "44px",
  },
  tokenListItemRow: {
    display: "flex",
    justifyContent: "space-between",
  },
  tokenListItemIcon: {
    paddingTop: "12px",
    paddingBottom: "12px",
  },
  tokenAmount: {
    fontWeight: 500,
    fontSize: "14px",
    color: theme.custom.colors.secondary,
    lineHeight: "20px",
  },
  balancesTableCellContainer: {
    width: "100%",
    height: "100%",
    display: "flex",
  },
  tokenListItemContent: {
    color: theme.custom.colors.fontColor,
    flex: 1,
    paddingTop: "10px",
    paddingBottom: "10px",
  },

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
  skeleton: {
    background: "rgba(0,0,0,0.15)",
  },
  copyIcon: {
    visibility: "hidden",
    width: "16px",
    marginLeft: "6px",
  },
}));

const RAMP_SUPPORTED_TOKENS = {
  [Blockchain.SOLANA]: [
    {
      title: "SOL",
      icon: SOL_LOGO_URI,
      subtitle: "Solana",
    },
  ],
  [Blockchain.ETHEREUM]: [
    {
      title: "ETH",
      subtitle: "Ethereum",
      icon: "/ethereum.png",
    },
  ],
};

export function Ramp({
  blockchain,
  publicKey,
}: {
  blockchain?: Blockchain;
  publicKey?: string;
}) {
  const wallets = useAllWalletsDisplayed();
  const [searchFilter, setSearchFilter] = useState("");
  const { push } = useNavigation();
  const classes = useStyles();

  // If prop one is undefined, both must be undefined.
  if ((blockchain && !publicKey) || (!blockchain && publicKey)) {
    throw new Error("invariant violation");
  }

  if (blockchain && publicKey) {
    return (
      <>
        <TextField
          placeholder="Search"
          value={searchFilter}
          setValue={setSearchFilter}
          rootClass={classes.searchField}
          inputProps={{
            style: {
              height: "48px",
            },
          }}
        />
        <RampCard
          searchFilter={searchFilter}
          key={blockchain}
          blockchain={blockchain}
          publicKey={publicKey}
          onStartRamp={({ publicKey, blockchain }: any) => {
            push("stripe", { publicKey, blockchain });
          }}
        />
      </>
    );
  }

  return (
    <>
      <TextField
        placeholder="Search"
        value={searchFilter}
        setValue={setSearchFilter}
        rootClass={classes.searchField}
        inputProps={{
          style: {
            height: "48px",
          },
        }}
      />
      <div
        style={{
          flex: 1,
        }}
      >
        {wallets.map(({ blockchain, publicKey }) => (
          <RampCard
            searchFilter={searchFilter}
            key={blockchain}
            blockchain={blockchain}
            publicKey={publicKey}
            onStartRamp={({ publicKey, blockchain }: any) => {
              push("stripe", { publicKey, blockchain });
            }}
          />
        ))}
      </div>
    </>
  );
}

function RampCard({
  blockchain,
  publicKey,
  onStartRamp,
  searchFilter,
}: {
  blockchain: Blockchain;
  publicKey: string;
  onStartRamp: any;
  searchFilter: string;
}) {
  // This component only works for the main gas tokens at the moment.
  const name = useWalletName(publicKey);
  return (
    <BalancesTable>
      <BalancesTableHead wallet={{ name, publicKey, blockchain }} />
      <BalancesTableContent>
        {RAMP_SUPPORTED_TOKENS[blockchain]
          .filter(
            ({ title, subtitle }) =>
              title.toLowerCase().includes(searchFilter.toLocaleLowerCase()) ||
              subtitle.toLowerCase().includes(searchFilter.toLowerCase())
          )
          .map((token: any) => (
            <BalancesTableRow
              onClick={() => onStartRamp({ blockchain, token, publicKey })}
            >
              <RampTokenCell token={token} />
            </BalancesTableRow>
          ))}
      </BalancesTableContent>
    </BalancesTable>
  );
}

function RampTokenCell({ token }: any) {
  const { icon, title, subtitle } = token;
  const classes = useStyles();
  return (
    <div className={classes.balancesTableCellContainer}>
      {icon ? (
        <ListItemIcon
          className={classes.tokenListItemIcon}
          classes={{ root: classes.tokenListItemIconRoot }}
        >
          <ProxyImage
            src={icon}
            className={classes.logoIcon}
            onError={(event: any) =>
              (event.currentTarget.style.display = "none")
            }
          />
        </ListItemIcon>
      ) : null}
      <div className={classes.tokenListItemContent}>
        <div className={classes.tokenListItemRow}>
          <Typography className={classes.tokenName}>{title}</Typography>
        </div>
        <div className={classes.tokenListItemRow}>
          {subtitle ? (
            <Typography className={classes.tokenAmount}>{subtitle}</Typography>
          ) : null}
        </div>
      </div>
    </div>
  );
}

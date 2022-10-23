import { Button as MuiButton, ListItemIcon, Typography } from "@mui/material";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import {
  SOL_LOGO_URI,
  useActiveWallets,
  useBlockchainLogo,
} from "@coral-xyz/recoil";
import { Blockchain, formatUSD } from "@coral-xyz/common";
import {
  PrimaryButton,
  TextField,
  walletAddressDisplay,
} from "../../../common";
import {
  BalancesTable,
  BalancesTableContent,
  BalancesTableHead,
  BalancesTableRow,
} from "../Balances";
import { WithCopyTooltip } from "../../../common/WithCopyTooltip";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import React, { useState } from "react";
import { TokenRow } from "../../../common/TokenTable";
import { ProxyImage } from "../../../common/ProxyImage";
import { useNavStack } from "../../../common/Layout/NavStack";

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
  tokenListItemRow: {
    display: "flex",
    justifyContent: "space-between",
  },
  logoIcon: {
    borderRadius: "22px",
    width: "44px",
    height: "44px",
  },
  tokenListItemIcon: {
    paddingTop: "12px",
    paddingBottom: "12px",
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
  name,
  publicKey,
}: {
  blockchain: Blockchain;
  name: string;
  publicKey: string;
}) {
  const activeWallets = useActiveWallets();
  const [searchFilter, setSearchFilter] = useState("");
  const { push } = useNavStack();
  const classes = useStyles();

  if (blockchain) {
    return (
      <>
        <TextField
          placeholder={"Search"}
          value={searchFilter}
          setValue={setSearchFilter}
          rootClass={classes.searchField}
          inputProps={{
            style: {
              height: "48px",
            },
          }}
        />
        <RampCard2
          searchFilter={searchFilter}
          key={blockchain}
          blockchain={blockchain}
          publicKey={publicKey}
          name={name}
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
        placeholder={"Search"}
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
        {activeWallets.map(({ blockchain, name, publicKey }) => (
          <RampCard2
            searchFilter={searchFilter}
            key={blockchain}
            blockchain={blockchain}
            name={name}
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

export function RampCard2({
  blockchain,
  name,
  publicKey,
  onStartRamp,
  searchFilter,
}: {
  blockchain: Blockchain;
  name: string;
  publicKey: string;
  onStartRamp: any;
  searchFilter: string;
}) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const blockchainLogo = useBlockchainLogo(blockchain);

  const classes = useStyles();
  const onCopy = () => {
    setTooltipOpen(true);
    setTimeout(() => setTooltipOpen(false), 1000);
    navigator.clipboard.writeText(publicKey);
  };

  return (
    <BalancesTable>
      <BalancesTableHead
        props={{
          title: blockchain,
          iconUrl: blockchainLogo,
          disableToggle: false,
          subtitle: (
            <WithCopyTooltip tooltipOpen={tooltipOpen}>
              <MuiButton
                disableRipple
                className={classes.addressButton}
                onClick={(e) => {
                  e.stopPropagation();
                  onCopy();
                }}
              >
                {walletAddressDisplay(publicKey)}
                <ContentCopyIcon className={classes.copyIcon} />
              </MuiButton>
            </WithCopyTooltip>
          ),
        }}
      />
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
export function RampCard({
  blockchain,
  name,
  publicKey,
  onStartRamp,
}: {
  blockchain: Blockchain;
  name: string;
  publicKey: string;
  onStartRamp: any;
}) {
  const theme = useCustomTheme();
  const blockchainLogo = useBlockchainLogo(blockchain);
  const startRamp = () => {
    onStartRamp({
      blockchain,
      publicKey,
    });
  };

  return (
    <>
      <div
        style={{
          marginBottom: "12px",
          borderRadius: "8px",
          padding: "10px",
          background: theme.custom.colors.nav,
          border: `${theme.custom.colors.borderFull}`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div>
            <Typography
              style={{
                color: theme.custom.colors.fontColor,
                fontWeight: 500,
              }}
            >
              {`${name} (${walletAddressDisplay(publicKey)})`}
            </Typography>
            <div>
              <img
                src={blockchainLogo}
                style={{
                  width: "14px",
                  borderRadius: "2px",
                }}
              />
            </div>
          </div>
          <div style={{ display: "flex" }}>
            <PrimaryButton
              onClick={startRamp}
              label={"Buy using Link"}
              style={{
                marginTop: "40px",
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function RampTokenCell({ token, style }: any) {
  const { icon, title, subtitle } = token;
  const classes = useStyles();
  return (
    <div className={classes.balancesTableCellContainer}>
      {!!icon && (
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
      )}
      <div className={classes.tokenListItemContent}>
        <div className={classes.tokenListItemRow}>
          <Typography className={classes.tokenName}>{title}</Typography>
        </div>
        <div className={classes.tokenListItemRow}>
          {subtitle && (
            <Typography className={classes.tokenAmount}>{subtitle}</Typography>
          )}
        </div>
      </div>
    </div>
  );
}

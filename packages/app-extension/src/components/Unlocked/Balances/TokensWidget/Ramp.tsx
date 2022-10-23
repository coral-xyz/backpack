import { Button as MuiButton, Typography } from "@mui/material";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { useBlockchainLogo } from "@coral-xyz/recoil";
import { Blockchain } from "@coral-xyz/common";
import { PrimaryButton, walletAddressDisplay } from "../../../common";
import {
  BalancesTable,
  BalancesTableContent,
  BalancesTableHead,
} from "../Balances";
import { WithCopyTooltip } from "../../../common/WithCopyTooltip";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useState } from "react";
import { TokenRow } from "../../../common/TokenTable";

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
      token: "SOL",
      iconUrl: "",
      address: "",
    },
  ],
  [Blockchain.ETHEREUM]: [
    {
      token: "ETH",
      iconUrl: "",
      address: "",
    },
  ],
};

export function RampCard2({
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
        {RAMP_SUPPORTED_TOKENS[blockchain].map((token: any) => (
          <TokenRow
            key={token.address}
            token={token}
            onClick={(token) => onStartRamp({ blockchain, token, publicKey })}
          />
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

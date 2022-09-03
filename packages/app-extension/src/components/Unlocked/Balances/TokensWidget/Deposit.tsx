import { useState } from "react";
import { Typography, MenuItem } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { useActiveWallets } from "@coral-xyz/recoil";
import { Blockchain } from "@coral-xyz/common";
import { WithHeaderButton } from "./Token";
import { BottomCard } from "./Send";
import {
  TextField,
  TextFieldLabel,
  walletAddressDisplay,
} from "../../../common";
import { useDrawerContext } from "../../../common/Layout/Drawer";
import { WithCopyTooltip } from "../../../common/WithCopyTooltip";

const useStyles = styles((theme) => ({
  subtext: {
    width: "264px",
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: "35px",
    color: theme.custom.colors.secondary,
    lineHeight: "16px",
    size: "12px",
    fontWeight: 500,
    fontSize: "14px",
    textAlign: "center",
  },
  depositTextFieldRoot: {
    margin: 0,
    "& .MuiOutlinedInput-root": {
      paddingRight: 0,
      "& fieldset": {
        border: `solid 1pt ${theme.custom.colors.border}`,
        borderColor: `${theme.custom.colors.border} !important`,
        paddingLeft: 0,
        paddingRight: 0,
      },
      "&.Mui-focused fieldset": {
        borderColor: `${theme.custom.colors.primaryButton} !important`,
      },
    },
    "& .MuiOutlinedInput-input": {
      cursor: "pointer",
      color: theme.custom.colors.secondary,
    },
    "&:hover .MuiOutlinedInput-root": {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
  copyIcon: {
    "&:hover": {
      cursor: "pointer",
    },
  },
  copyContainer: {
    "&:hover": {
      cursor: "pointer",
    },
  },
  copyButton: {
    background: "transparent",
    padding: 0,
  },
  copyButtonLabel: {
    color: theme.custom.colors.activeNavButton,
    fontWeight: 500,
    fontSize: "14px",
    lineHeight: "24px",
    textTransform: "none",
  },
}));

export function DepositButton({ token }: any) {
  return (
    <WithHeaderButton
      label={"Deposit"}
      routes={[
        {
          component: Deposit,
          title: `${token.ticker} / Deposit`,
          name: "deposit",
        },
      ]}
    />
  );
}

export function Deposit() {
  const classes = useStyles();
  const theme = useCustomTheme();
  const { close } = useDrawerContext();
  const activeWallets = useActiveWallets();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [blockchain, setBlockchain] = useState<Blockchain>(Blockchain.SOLANA);
  const activeWallet = activeWallets.find((w) => w.blockchain === blockchain);

  if (!activeWallet) {
    return <></>;
  }

  const onCopy = () => {
    setTooltipOpen(true);
    setTimeout(() => setTooltipOpen(false), 1000);
    navigator.clipboard.writeText(activeWallet.publicKey.toString());
  };

  const blockchainOptions = [
    { value: Blockchain.SOLANA, label: "Solana" },
    { value: Blockchain.ETHEREUM, label: "Ethereum" },
  ];

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          flex: 1,
        }}
      ></div>
      <div
        style={{
          height: "439px",
        }}
      >
        <BottomCard
          buttonLabel={"Close"}
          onButtonClick={close}
          buttonStyle={{
            backgroundColor: `${theme.custom.colors.nav}`,
          }}
          buttonLabelStyle={{
            color: theme.custom.colors.fontColor,
          }}
          topHalfStyle={{
            background: "transparent",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 28,
              left: 0,
              right: 0,
              marginLeft: "auto",
              marginRight: "auto",
              width: "148px",
            }}
          >
            <QrCode data={activeWallet.publicKey.toString()} />
          </div>
          <div style={{ marginTop: "100px" }}>
            <TextFieldLabel
              leftLabel={"Blockchain"}
              style={{ marginLeft: "24px", marginRight: "24px" }}
            />
            <div style={{ margin: "0 12px 16px 12px" }}>
              <TextField
                label="Blockchain"
                value={blockchain}
                setValue={setBlockchain}
                select={true}
                rootClass={classes.depositTextFieldRoot}
              >
                {blockchainOptions.map((o, idx) => (
                  <MenuItem value={o.value} key={idx}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
            </div>
            <div>
              <TextFieldLabel
                leftLabel={"Deposit to"}
                style={{ marginLeft: "24px", marginRight: "24px" }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  margin: "0 12px",
                }}
              >
                <WithCopyTooltip tooltipOpen={tooltipOpen}>
                  <div
                    onClick={() => onCopy()}
                    style={{ width: "100%" }}
                    className={classes.copyContainer}
                  >
                    <TextField
                      value={`${activeWallet.name} (${walletAddressDisplay(
                        activeWallet.publicKey
                      )})`}
                      rootClass={classes.depositTextFieldRoot}
                      endAdornment={
                        <ContentCopyIcon
                          className={classes.copyIcon}
                          style={{
                            pointerEvents: "none",
                            color: theme.custom.colors.secondary,
                            position: "absolute",
                            right: "17px",
                          }}
                        />
                      }
                      inputProps={{
                        readOnly: true,
                      }}
                    />
                  </div>
                </WithCopyTooltip>
              </div>
            </div>
            <div>
              <Typography className={classes.subtext}>
                {activeWallet.blockchain === Blockchain.SOLANA && (
                  <>
                    This address can only receive SOL and SPL tokens on Solana.
                  </>
                )}
                {activeWallet.blockchain === Blockchain.ETHEREUM && (
                  <>
                    This address can only receive ETH and ERC20 tokens on
                    Ethereum.
                  </>
                )}
              </Typography>
            </div>
          </div>
        </BottomCard>
      </div>
    </div>
  );
}

export function QrCode({ data }: { data: string }) {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "8px",
        height: "148px",
        width: "148px",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        padding: "8px",
      }}
    >
      <img src={`https://qr.warp.workers.dev/qz=0?${data}`} alt={data} />
    </div>
  );
}

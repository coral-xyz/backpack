import { useState, useEffect } from "react";
import { Modal, Typography } from "@mui/material";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import {
  useAnchorContext,
  useEthereumCtx,
  useActiveWallets,
  useBlockchainLogo,
} from "@coral-xyz/recoil";
import { Blockchain } from "@coral-xyz/common";
import { PrimaryButton, walletAddressDisplay } from "../../../common";
import { CloseButton, useDrawerContext } from "../../../common/Layout/Drawer";
import { useNavStack } from "../../../common/Layout/NavStack";
import { QrCode } from "./Deposit";

const useStyles = styles((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  topHalf: {
    paddingTop: "24px",
    flex: 1,
  },
  buttonContainer: {
    display: "flex",
    paddingLeft: "12px",
    paddingRight: "12px",
    paddingBottom: "24px",
    paddingTop: "25px",
    justifyContent: "space-between",
  },
  textRoot: {
    marginTop: "0 !important",
    marginBottom: "0 !important",
    "& .MuiOutlinedInput-root": {
      backgroundColor: `${theme.custom.colors.nav} !important`,
    },
  },
  bottomHalfLabel: {
    fontWeight: 500,
    color: theme.custom.colors.secondary,
    fontSize: "12px",
    lineHeight: "16px",
  },
  confirmRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  confirmRowLabelLeft: {
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 500,
    color: theme.custom.colors.secondary,
  },
  confirmRowLabelRight: {
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 500,
    color: theme.custom.colors.fontColor,
  },
  confirmTableListItem: {
    "&:hover": {
      opacity: 1,
    },
  },
}));

export function Ramp({
  address,
  blockchain,
}: {
  blockchain: Blockchain;
  address: string;
}) {
  const classes = useStyles() as any;
  const { close } = useDrawerContext();
  const { title, setTitle } = useNavStack();
  const { provider: solanaProvider } = useAnchorContext();
  const ethereumCtx = useEthereumCtx();
  const [openDrawer, setOpenDrawer] = useState(false);
  const activeWallets = useActiveWallets();

  useEffect(() => {
    const prev = title;
    setTitle(`Ramp`);
    return () => {
      setTitle(prev);
    };
  }, []);

  if (blockchain) {
    return (
      <RampCard
        key={blockchain}
        blockchain={blockchain}
        publicKey={address}
        name={""}
      />
    );
  }

  return (
    <div
      style={{
        flex: 1,
      }}
    >
      {activeWallets.map(({ blockchain, name, publicKey }) => (
        <RampCard
          key={blockchain}
          blockchain={blockchain}
          name={name}
          publicKey={publicKey}
        />
      ))}
    </div>
  );
}

function RampCard({
  blockchain,
  name,
  publicKey,
}: {
  blockchain: Blockchain;
  name: string;
  publicKey: string;
}) {
  const theme = useCustomTheme();
  const blockchainLogo = useBlockchainLogo(blockchain);
  const nav = useNavStack();

  const startRamp = () => {
    nav.push("stripe-onramp", {
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

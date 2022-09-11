import { useState, useEffect } from "react";
import { IconButton, Typography, Modal } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import QrCodeIcon from "@mui/icons-material/QrCode";
import { useCustomTheme } from "@coral-xyz/themes";
import { useActiveWallets, useBlockchainLogo } from "@coral-xyz/recoil";
import { Blockchain } from "@coral-xyz/common";
import { walletAddressDisplay, SecondaryButton } from "../../../common";
import { useDrawerContext } from "../../../common/Layout/Drawer";
import { WithCopyTooltip } from "../../../common/WithCopyTooltip";
import { useNavStack } from "../../../common/Layout/NavStack";

export function Deposit({ ...props }: any) {
  const nav = useNavStack();
  const { close } = useDrawerContext();
  const activeWallets = useActiveWallets();

  useEffect(() => {
    nav.setStyle({
      borderBottom: "none",
    });
  }, []);

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "12px",
      }}
    >
      <div
        style={{
          flex: 1,
        }}
      >
        {activeWallets.map(({ blockchain, name, publicKey }) => (
          <BlockchainDepositCard
            key={blockchain}
            blockchain={blockchain}
            name={name}
            publicKey={publicKey}
          />
        ))}
      </div>
      <SecondaryButton label="Close" onClick={() => close()} />
    </div>
  );
}

function BlockchainDepositCard({
  blockchain,
  name,
  publicKey,
}: {
  blockchain: Blockchain;
  name: string;
  publicKey: string;
}) {
  const theme = useCustomTheme();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const blockchainLogo = useBlockchainLogo(blockchain);

  const onCopy = () => {
    setTooltipOpen(true);
    setTimeout(() => setTooltipOpen(false), 1000);
    navigator.clipboard.writeText(publicKey.toString());
  };
  const onQrCode = () => {
    setShowQrCode(true);
  };

  return (
    <>
      <div
        style={{
          marginBottom: "12px",
          borderRadius: "8px",
          padding: "16px",
          background: theme.custom.colors.nav,
        }}
      >
        <Typography
          style={{
            color: theme.custom.colors.fontColor,
            fontWeight: 500,
          }}
        >
          Your {blockchain.slice(0, 1).toUpperCase() + blockchain.slice(1)}{" "}
          address
        </Typography>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div>
            <Typography
              style={{
                fontWeight: 500,
                fontSize: "14px",
                marginTop: "6px",
                marginBottom: "6px",
                color: theme.custom.colors.secondary,
              }}
            >
              {`${name} (${walletAddressDisplay(publicKey)})`}
            </Typography>
            <img
              src={blockchainLogo}
              style={{
                width: "14px",
                borderRadius: "2px",
              }}
            />
          </div>
          <div style={{ display: "flex" }}>
            <IconButton
              disableRipple
              onClick={() => onQrCode()}
              style={{
                backgroundColor: theme.custom.colors.bg2,
                padding: "10px",
                marginRight: "6px",
                width: "40px",
                height: "40px",
              }}
            >
              <QrCodeIcon
                style={{
                  color: theme.custom.colors.fontColor,
                  width: "20px",
                  height: "20px",
                }}
              />
            </IconButton>
            <WithCopyTooltip tooltipOpen={tooltipOpen}>
              <IconButton
                disableRipple
                onClick={() => onCopy()}
                style={{
                  backgroundColor: theme.custom.colors.bg2,
                  padding: "10px",
                  width: "40px",
                  height: "40px",
                }}
              >
                <ContentCopyIcon
                  style={{
                    color: theme.custom.colors.fontColor,
                    width: "20px",
                    height: "20px",
                  }}
                />
              </IconButton>
            </WithCopyTooltip>
          </div>
        </div>
      </div>
      <Modal open={showQrCode} onClose={() => setShowQrCode(false)}>
        <div
          style={{
            margin: 0,
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            style={{
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <QrCode data={publicKey.toString()} />
          </div>
        </div>
      </Modal>
    </>
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

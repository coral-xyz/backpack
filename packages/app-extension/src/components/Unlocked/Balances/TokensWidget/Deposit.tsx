import { useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import { SecondaryButton } from "@coral-xyz/react-common";
import {
  blockchainConfigAtom,
  getBlockchainLogo,
  useAllWalletsDisplayed,
} from "@coral-xyz/recoil";
import { BpSecondaryButton, StyledText, useTheme } from "@coral-xyz/tamagui";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import QrCodeIcon from "@mui/icons-material/QrCode";
import { IconButton, Modal, Typography } from "@mui/material";
import { useRecoilValue } from "recoil";

import { formatWalletAddress } from "../../../common";
import { CloseButton, useDrawerContext } from "../../../common/Layout/Drawer";
import { WithCopyTooltip } from "../../../common/WithCopyTooltip";

export function Deposit({ ...props }: any) {
  const activeWallets = useAllWalletsDisplayed();

  if (activeWallets.length === 1) {
    const { blockchain, publicKey } = activeWallets[0];
    return <_Deposit blockchain={blockchain} publicKey={publicKey} />;
  }

  if (props.blockchain && props.publicKey) {
    return <_Deposit {...props} />;
  }
  return <DepositMultiWallet {...props} />;
}

function DepositMultiWallet() {
  const { close } = useDrawerContext();
  const { t } = useTranslation();
  const activeWallets = useAllWalletsDisplayed();

  return (
    <div
      style={{
        height: activeWallets.length <= 3 ? "100%" : undefined, // Hack. We do this to force the close button to the bottom.
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "12px",
        paddingBottom: "16px",
      }}
    >
      <div>
        {activeWallets.map(({ blockchain, name, publicKey }) => (
          <BlockchainDepositCard
            key={blockchain}
            blockchain={blockchain}
            name={name}
            publicKey={publicKey}
          />
        ))}
      </div>
      <div style={{ flex: 1 }} />
      <SecondaryButton label={t("close")} onClick={() => close()} />
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
  const theme = useTheme();
  const { t } = useTranslation();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipOpenModal, setTooltipOpenModal] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const blockchainLogo = getBlockchainLogo(blockchain);
  const blockchainDisplay =
    blockchain.slice(0, 1).toUpperCase() + blockchain.slice(1);

  const onCopy = async () => {
    setTooltipOpen(true);
    setTimeout(() => setTooltipOpen(false), 1000);
    await navigator.clipboard.writeText(publicKey.toString());
  };

  const onCopyModal = async () => {
    setTooltipOpenModal(true);
    setTimeout(() => setTooltipOpenModal(false), 1000);
    await navigator.clipboard.writeText(publicKey.toString());
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
          background: theme.baseBackgroundL1.val,
          border: `${theme.baseBorderLight.val}`,
        }}
      >
        <Typography
          style={{
            color: theme.baseTextHighEmphasis.val,
            fontWeight: 500,
          }}
        >
          {t("your_blockchain_address", { blockchainDisplay })}
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
                color: theme.baseTextMedEmphasis.val,
              }}
            >
              {`${name} (${formatWalletAddress(publicKey)})`}
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
                backgroundColor: theme.baseBackgroundL2.val,
                padding: "10px",
                marginRight: "6px",
                width: "40px",
                height: "40px",
              }}
            >
              <QrCodeIcon
                style={{
                  color: theme.baseTextHighEmphasis.val,
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
                  backgroundColor: theme.baseBackgroundL2.val,
                  padding: "10px",
                  width: "40px",
                  height: "40px",
                }}
              >
                <ContentCopyIcon
                  style={{
                    color: theme.baseTextHighEmphasis.val,
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
            width: "300px",
            height: "325px",
            top: "50%",
            left: "50%",
            position: "absolute",
            transform: "translate(-50%, -50%)",
            backgroundColor: theme.baseBackgroundL1.val,
            margin: 0,
            borderRadius: "12px",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 10,
                left: 10,
              }}
            >
              <CloseButton
                buttonStyle={{ position: "relative" }}
                onClick={() => setShowQrCode(false)}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "column",
                    marginRight: "8px",
                  }}
                >
                  <img
                    src={blockchainLogo}
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "2px",
                    }}
                  />
                </div>
                <Typography
                  style={{
                    fontSize: "22px",
                    color: theme.baseTextHighEmphasis.val,
                  }}
                >
                  {blockchainDisplay}
                </Typography>
              </div>
              <div
                style={{
                  marginLeft: "auto",
                  marginRight: "auto",
                  marginTop: "24px",
                  marginBottom: "16px",
                }}
              >
                <QrCode data={publicKey.toString()} />
              </div>
              <WithCopyTooltip tooltipOpen={tooltipOpenModal}>
                <div style={{ display: "relative" }}>
                  <IconButton
                    disableRipple
                    style={{
                      padding: 0,
                      textTransform: "none",
                      display: "flex",
                      flexDirection: "column",
                      marginLeft: "auto",
                      marginRight: "auto",
                    }}
                    onClick={() => onCopyModal()}
                  >
                    <Typography
                      style={{
                        textAlign: "center",
                        color: theme.baseTextHighEmphasis.val,
                        fontSize: "16px",
                      }}
                    >
                      {name}
                    </Typography>
                    <Typography
                      style={{
                        textAlign: "center",
                        color: theme.baseTextMedEmphasis.val,
                      }}
                    >
                      ({formatWalletAddress(publicKey)})
                    </Typography>
                  </IconButton>
                </div>
              </WithCopyTooltip>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

function _Deposit({
  blockchain,
  publicKey,
}: {
  blockchain: Blockchain;
  publicKey: string;
}) {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);
  const blockchainConfig = useRecoilValue(blockchainConfigAtom(blockchain));
  const { t } = useTranslation();

  const onCopy = async () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 5000);
    await navigator.clipboard.writeText(publicKey.toString());
  };

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
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "32px",
          marginLeft: "auto",
          marginRight: "auto",
          marginTop: "64px",
          width: "180px",
        }}
      >
        <QrCode
          data={publicKey.toString()}
          style={{ width: "180px", height: "180px", padding: "7.83px" }}
        />
        <Typography
          style={{
            background: "transparent",
            color: theme.baseTextHighEmphasis.val,
            lineBreak: "anywhere",
            textAlign: "center",
            width: "250px",
          }}
        >
          {publicKey}
        </Typography>
        <BpSecondaryButton
          label={copied ? "Copied!" : "Copy address"}
          onPress={onCopy}
          backgroundColor="$accentBlueBackground"
          labelProps={{
            color: "$accentBlue",
          }}
          borderWidth="0px"
          outlineWidth="0px"
          borderRadius={12}
          color="transparent"
        />
        <StyledText
          width="240px"
          color="$baseTextMedEmphasis"
          fontSize="$sm"
          textAlign="center"
        >
          {t("address_receive_warning", {
            gasTokenName: blockchainConfig!.GasTokenName,
            appTokenName: blockchainConfig!.AppTokenName,
            name: blockchainConfig!.Name,
          })}
        </StyledText>
      </div>
    </div>
  );
}

function QrCode({
  data,
  style,
}: {
  data: string;
  style?: React.CSSProperties;
}) {
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
        ...style,
      }}
    >
      <img src={`https://qr.backpack.workers.dev/qz=0?${data}`} alt={data} />
    </div>
  );
}

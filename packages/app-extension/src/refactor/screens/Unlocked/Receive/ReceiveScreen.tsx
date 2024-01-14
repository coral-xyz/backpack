import { useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import {
  blockchainConfigAtom,
  useAllWalletsDisplayed,
} from "@coral-xyz/recoil";
import { BpSecondaryButton, StyledText, useTheme } from "@coral-xyz/tamagui";
import { Typography } from "@mui/material";
import { useRecoilValue } from "recoil";

import { ScreenContainer } from "../../../components/ScreenContainer";
import type { ReceiveScreenProps } from "../../../navigation/ReceiveNavigator";

export function ReceiveScreen(_props: ReceiveScreenProps) {
  return (
    <ScreenContainer loading={<Loading />}>
      <Container />
    </ScreenContainer>
  );
}

function Container() {
  const activeWallets = useAllWalletsDisplayed();
  const { blockchain, publicKey } = activeWallets[0];

  return <ContainerInner blockchain={blockchain} publicKey={publicKey} />;
}

// TODO: tamagui.
function ContainerInner({
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

function Loading() {
  // TODO.
  return null;
}

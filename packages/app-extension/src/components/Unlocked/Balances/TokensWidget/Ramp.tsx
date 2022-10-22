import { Typography } from "@mui/material";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { useBlockchainLogo } from "@coral-xyz/recoil";
import { Blockchain } from "@coral-xyz/common";
import { PrimaryButton, walletAddressDisplay } from "../../../common";

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

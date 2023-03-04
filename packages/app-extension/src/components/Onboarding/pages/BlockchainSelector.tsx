import { Blockchain } from "@coral-xyz/common";
import { PrimaryButton } from "@coral-xyz/react-common";
import { Box, Grid, Typography } from "@mui/material";

import { Header, SubtextParagraph } from "../../common";
import {
  BscIcon,
  EthereumIconOnboarding as EthereumIcon,
  PolygonIcon,
  SolanaIconOnboarding as SolanaIcon,
} from "../../common/Icon";
import { ActionCard } from "../../common/Layout/ActionCard";

export const BlockchainSelector = ({
  selectedBlockchains,
  onClick,
  onNext,
  isRecovery = false,
}: {
  selectedBlockchains: Array<Blockchain>;
  onClick: (blockchain: Blockchain) => void;
  onNext: () => void;
  isRecovery?: boolean;
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <Box
          sx={{
            marginLeft: "24px",
            marginRight: "24px",
            marginTop: "24px",
          }}
        >
          {isRecovery ? (
            <>
              <Header text="Which network would you like to use to recover your username?" />
              <SubtextParagraph>
                Select one. You can add more networks after you've recovered
                your username.
              </SubtextParagraph>
            </>
          ) : (
            <>
              <Header text="Which networks would you like Backpack to use?" />
              <SubtextParagraph>
                Select one or more. You can change this later in the settings
                menu.
              </SubtextParagraph>
            </>
          )}
        </Box>
        <Box style={{ padding: "0 16px 16px" }}>
          <Grid container spacing={1.5}>
            <Grid item xs={6}>
              <ActionCard
                icon={<EthereumIcon />}
                text="Ethereum"
                textAdornment={
                  selectedBlockchains.includes(Blockchain.ETHEREUM) ? (
                    <CheckBadge />
                  ) : (
                    ""
                  )
                }
                onClick={() => onClick(Blockchain.ETHEREUM)}
              />
            </Grid>
            <Grid item xs={6}>
              <ActionCard
                icon={<SolanaIcon />}
                text="Solana"
                textAdornment={
                  selectedBlockchains.includes(Blockchain.SOLANA) ? (
                    <CheckBadge />
                  ) : (
                    ""
                  )
                }
                onClick={() => onClick(Blockchain.SOLANA)}
              />
            </Grid>
            <Grid item xs={6}>
              <ActionCard
                icon={<PolygonIcon />}
                text="Polygon"
                textAdornment={<SoonBadge />}
                onClick={() => {}}
                disabled
              />
            </Grid>
            <Grid item xs={6}>
              <ActionCard
                icon={<BscIcon />}
                text="BSC"
                textAdornment={<SoonBadge />}
                onClick={() => {}}
                disabled
              />
            </Grid>
            {/*
            <Grid item xs={6}>
              <ActionCard
                icon={<AvalancheIcon />}
                text="Avalanche"
                textAdornment={<SoonBadge />}
                onClick={() => {}}
                disabled={true}
              />
            </Grid>
            <Grid item xs={6}>
              <ActionCard
                icon={<CosmosIcon />}
                text="Cosmos"
                textAdornment={<SoonBadge />}
                onClick={() => {}}
                disabled={true}
              />
            </Grid>
            */}
          </Grid>
        </Box>
      </Box>
      <Box style={{ padding: "16px" }}>
        <PrimaryButton
          label="Next"
          onClick={onNext}
          disabled={selectedBlockchains.length === 0}
        />
      </Box>
    </Box>
  );
};

function CheckBadge() {
  return (
    <div
      style={{
        display: "inline-block",
        position: "relative",
        top: "4px",
        left: "5px",
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9 1.5C4.86 1.5 1.5 4.86 1.5 9C1.5 13.14 4.86 16.5 9 16.5C13.14 16.5 16.5 13.14 16.5 9C16.5 4.86 13.14 1.5 9 1.5ZM6.9675 12.2175L4.275 9.525C3.9825 9.2325 3.9825 8.76 4.275 8.4675C4.5675 8.175 5.04 8.175 5.3325 8.4675L7.5 10.6275L12.66 5.4675C12.9525 5.175 13.425 5.175 13.7175 5.4675C14.01 5.76 14.01 6.2325 13.7175 6.525L8.025 12.2175C7.74 12.51 7.26 12.51 6.9675 12.2175Z"
          fill="#42C337"
        />
      </svg>
    </div>
  );
}

function SoonBadge() {
  return (
    <div
      style={{
        paddingLeft: "8px",
        paddingRight: "8px",
        paddingTop: "2px",
        paddingBottom: "2px",
        backgroundColor: "rgb(206, 121, 7, 0.15)",
        height: "20px",
        borderRadius: "10px",
        display: "inline-block",
        marginLeft: "4px",
      }}
    >
      <Typography
        style={{
          color: "#EFA411",
          fontSize: "12px",
          lineHeight: "16px",
          fontWeight: 600,
        }}
      >
        soon
      </Typography>
    </div>
  );
}

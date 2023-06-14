import { Blockchain } from "@coral-xyz/common";
import { PrimaryButton } from "@coral-xyz/react-common";
import { Box, Grid } from "@mui/material";

import { Header, SubtextParagraph } from "../../common";
import {
  EthereumIconOnboarding as EthereumIcon,
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
                checked={selectedBlockchains.includes(Blockchain.ETHEREUM)}
                text="Ethereum"
                onClick={() => onClick(Blockchain.ETHEREUM)}
              />
            </Grid>
            <Grid item xs={6}>
              <ActionCard
                icon={<SolanaIcon />}
                checked={selectedBlockchains.includes(Blockchain.SOLANA)}
                text="Solana"
                onClick={() => onClick(Blockchain.SOLANA)}
              />
            </Grid>
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

// function SoonBadge() {
//   return (
//     <div
//       style={{
//         paddingLeft: "8px",
//         paddingRight: "8px",
//         paddingTop: "2px",
//         paddingBottom: "2px",
//         backgroundColor: "rgb(206, 121, 7, 0.15)",
//         height: "20px",
//         borderRadius: "10px",
//         display: "inline-block",
//         marginLeft: "4px",
//       }}
//     >
//       <Typography
//         style={{
//           color: "#EFA411",
//           fontSize: "12px",
//           lineHeight: "16px",
//           fontWeight: 600,
//         }}
//       >
//         soon
//       </Typography>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import {
  openConnectHardware,
  UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_READ,
} from "@coral-xyz/common";
import { HardwareWalletIcon } from "@coral-xyz/react-common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { AddCircle, ArrowCircleDown } from "@mui/icons-material";
import { Box, Grid } from "@mui/material";

import { Header, SubtextParagraph } from "../../../common";
import { ActionCard } from "../../../common/Layout/ActionCard";
import { useNavigation } from "../../../common/Layout/NavStack";

export function ImportMenu({ blockchain }: { blockchain: Blockchain }) {
  const nav = useNavigation();
  const background = useBackgroundClient();
  const [keyringExists, setKeyringExists] = useState(false);
  const theme = useCustomTheme();

  useEffect(() => {
    const prevTitle = nav.title;
    nav.setOptions({ headerTitle: "" });
    return () => {
      nav.setOptions({ headerTitle: prevTitle });
    };
  }, [nav.setOptions]);

  useEffect(() => {
    (async () => {
      const blockchainKeyrings = await background.request({
        method: UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_READ,
        params: [],
      });
      setKeyringExists(blockchainKeyrings.includes(blockchain));
    })();
  }, [blockchain]);

  const createNew = () => {};

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Box sx={{ margin: "24px" }}>
          <Header text="Import a wallet" />
          <SubtextParagraph>
            Import a wallet and associate it with your Backpack account.
          </SubtextParagraph>
        </Box>

        <Box sx={{ margin: "0 16px" }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <ActionCard
                icon={
                  <AddCircle
                    style={{
                      color: theme.custom.colors.icon,
                    }}
                  />
                }
                text="Import using phrase"
                onClick={createNew}
              />
            </Grid>
            <Grid item xs={6}>
              <ActionCard
                icon={
                  <HardwareWalletIcon
                    fill={theme.custom.colors.icon}
                    style={{
                      width: "24px",
                      height: "24px",
                    }}
                  />
                }
                text="Import using hardware"
                onClick={() => {
                  openConnectHardware(blockchain, "import");
                  window.close();
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <ActionCard
                icon={
                  <ArrowCircleDown
                    style={{
                      color: theme.custom.colors.icon,
                    }}
                  />
                }
                text="Import using secret key"
                onClick={() => nav.push("import-secret-key", { blockchain })}
              />
            </Grid>
          </Grid>
        </Box>
      </div>
    </>
  );
}

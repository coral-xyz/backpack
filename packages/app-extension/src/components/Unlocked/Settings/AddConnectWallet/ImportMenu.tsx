import { useEffect, useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import {
  openConnectHardware,
  UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_READ,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { Box, Grid } from "@mui/material";

import { Header, SubtextParagraph } from "../../../common";
import { ActionCard } from "../../../common/Layout/ActionCard";
import { useNavigation } from "../../../common/Layout/NavStack";

export function ImportMenu({ blockchain }: { blockchain: Blockchain }) {
  const nav = useNavigation();
  const background = useBackgroundClient();
  const [keyringExists, setKeyringExists] = useState(false);

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
          <Header text="Advanced import" />
          <SubtextParagraph>
            Import a wallet and associate it with your Backpack account.
          </SubtextParagraph>
        </Box>

        <Box sx={{ margin: "0 16px" }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ActionCard
                text="Import from secret recovery phrase"
                subtext="Select from a list of wallets found using a secret recovery phrase."
                onClick={() => nav.push("import-from-mnemonic", { blockchain })}
              />
            </Grid>
            <Grid item xs={12}>
              <ActionCard
                text="Import from hardware wallet"
                subtext="Select from a list of wallets found using your hardware wallet."
                onClick={() => {
                  openConnectHardware(blockchain, "import");
                  window.close();
                }}
              />
            </Grid>
            {keyringExists && (
              <Grid item xs={12}>
                <ActionCard
                  text="Import from secret key"
                  subtext="Import a wallet using a secret key."
                  onClick={() =>
                    nav.push("import-from-secret-key", { blockchain })
                  }
                />
              </Grid>
            )}
          </Grid>
        </Box>
      </div>
    </>
  );
}

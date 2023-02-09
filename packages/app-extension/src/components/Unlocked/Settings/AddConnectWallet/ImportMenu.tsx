import { useEffect, useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import {
  openConnectHardware,
  UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_READ,
} from "@coral-xyz/common";
import { useBackgroundClient, useKeyringHasMnemonic } from "@coral-xyz/recoil";
import { Box, Grid } from "@mui/material";

import { Header, SubtextParagraph } from "../../../common";
import { ActionCard } from "../../../common/Layout/ActionCard";
import { useNavigation } from "../../../common/Layout/NavStack";

export function ImportMenu({ blockchain }: { blockchain: Blockchain }) {
  const nav = useNavigation();
  const background = useBackgroundClient();
  const hasMnemonic = useKeyringHasMnemonic();
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
            {(keyringExists || hasMnemonic) && (
              // The blockchain keyring must exist or there must be a mnemonic
              // to allow imports from secret recovery phrases. If there is no
              // mnemonic and the keyring does not exist a secret recovery phrase
              // import can only done via a private key, and you can't currently
              // init a blockchain keyring using a private key based wallet.
              <Grid item xs={12}>
                <ActionCard
                  text="Import from secret recovery phrase"
                  subtext="Select from a list of wallets found using a secret recovery phrase."
                  onClick={() =>
                    nav.push("import-from-mnemonic", {
                      blockchain,
                      keyringExists,
                      hasMnemonic,
                    })
                  }
                />
              </Grid>
            )}
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
              // TODO allow creating a keyring from just a private key
              // https://github.com/coral-xyz/backpack/issues/2164
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

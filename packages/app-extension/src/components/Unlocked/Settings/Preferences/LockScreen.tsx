import { UI_RPC_METHOD_SETTINGS_LOCK_SCREEN_URL_UPDATE } from "@coral-xyz/common";
import { useBackgroundClient, usePakkus } from "@coral-xyz/recoil";
import { Image as ImageIcon } from "@mui/icons-material";
import { Button, Grid } from "@mui/material";
import { useEffect } from "react";
import { EmptyState } from "../../../common/EmptyState";
import { useNavStack } from "../../../common/Layout/NavStack";

export function PreferencesLockScreen() {
  const nav = useNavStack();
  const pakkus = usePakkus();

  useEffect(() => {
    nav.setTitle("Lock Screen Background");
  }, []);

  return (
    <>
      {pakkus.length > 0 ? (
        <div style={{ padding: "16px" }}>
          <Grid container spacing={{ xs: 2, ms: 2, md: 2, lg: 2 }}>
            {pakkus.map((pakku: any, idx: number) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={idx}>
                <PakkuCard pakku={pakku} />
              </Grid>
            ))}
          </Grid>
        </div>
      ) : (
        <EmptyState
          icon={(props: any) => <ImageIcon {...props} />}
          title={"No Pakkus"}
          subtitle={"Create a Pakku for an NFT to set a new lock screen"}
        />
      )}
    </>
  );
}

function PakkuCard({ pakku }: any) {
  const nav = useNavStack();
  const background = useBackgroundClient();

  const parsedUri = pakku.accounts.uri.replace(
    "ipfs://",
    "https://ipfs.io/ipfs/"
  );

  const handleClick = async () => {
    await background.request({
      method: UI_RPC_METHOD_SETTINGS_LOCK_SCREEN_URL_UPDATE,
      params: [parsedUri],
    });
    nav.pop();
  };

  return (
    <Button
      style={{
        position: "relative",
        padding: 0,
        borderRadius: "8px",
        overflow: "hidden",
        minWidth: "150px",
        minHeight: "150px",
        aspectRatio: "1",
      }}
      onClick={handleClick}
      disableRipple
    >
      <img
        style={{ width: "100%" }}
        src={parsedUri}
        onError={(event) => (event.currentTarget.style.display = "none")}
      />
    </Button>
  );
}

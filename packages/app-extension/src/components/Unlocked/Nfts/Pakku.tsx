import { externalResourceUri } from "@coral-xyz/common";
import { useCustomTheme } from "@coral-xyz/themes";
import { Grid, Typography } from "@mui/material";
import { useMemo } from "react";

export function PakkusList({ pakkus }: { pakkus: any[] }) {
  const theme = useCustomTheme();

  return (
    <div style={{ marginTop: "16px" }}>
      <Typography
        style={{
          color: theme.custom.colors.secondary,
          fontWeight: 500,
          fontSize: "16px",
          lineHeight: "24px",
        }}
      >
        Pakkus
      </Typography>
      <Grid
        container
        style={{ paddingTop: "4px" }}
        spacing={{ xs: 2, ms: 2, md: 2, lg: 2 }}
      >
        {pakkus.map((p: any, idx: number) => (
          <Grid key={idx} xs={3} sm={3} md={2} lg={2} item>
            <PreviewImage
              id={p.account.id}
              src={p.metadata.tokenMetaUriData.image}
            />
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

function PreviewImage({ id, src }: { id: number[]; src: string }) {
  const theme = useCustomTheme();
  const uri = useMemo(() => externalResourceUri(src), [src]);
  const label = useMemo(() => Buffer.from(id).toString(), [id]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <img style={{ width: "50px" }} src={uri} />
      <Typography
        style={{
          color: theme.custom.colors.fontColor,
          fontWeight: 500,
          fontSize: "10px",
          lineHeight: "18px",
        }}
      >
        {label}
      </Typography>
    </div>
  );
}

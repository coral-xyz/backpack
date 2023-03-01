import { XNFT_GG_LINK } from "@coral-xyz/common";
import { EmptyState } from "@coral-xyz/react-common";
import { useCustomTheme } from "@coral-xyz/themes";
import { Bolt } from "@mui/icons-material";

// User has no transactions
export function NoRecentActivityLabel({ minimize }: { minimize: boolean }) {
  const theme = useCustomTheme();
  return (
    <div
      style={{
        height: "100%",
        display: minimize ? "none" : undefined,
      }}
    >
      <EmptyState
        icon={(props: any) => <Bolt {...props} />}
        title="No Recent Activity"
        subtitle="Get started by adding your first xNFT"
        onClick={() => window.open(XNFT_GG_LINK)}
        buttonText="Browse the xNFT Library"
        contentStyle={{
          color: minimize ? theme.custom.colors.secondary : "inherit",
        }}
        innerStyle={{
          marginBottom: minimize !== true ? "64px" : 0, // Tab height offset.
        }}
        minimize={minimize}
      />
    </div>
  );
}

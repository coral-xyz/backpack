import { useCustomTheme } from "@coral-xyz/themes";

import { AddAssetsCard } from "./AddAssetsCard";

export function SwapPage() {
  const theme = useCustomTheme();
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div
          style={{
            flex: 1,
            color: theme.custom.colors.background,
            fontSize: 16,
            fontWeight: 500,
            display: "flex",
            justifyContent: "center",
          }}
        >
          Your offer
        </div>
        <div
          style={{
            flex: 1,
            color: theme.custom.colors.background,
            fontSize: 16,
            fontWeight: 500,
            display: "flex",
            justifyContent: "center",
          }}
        >
          Their offer
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div
          style={{
            flex: 1,
            color: theme.custom.colors.background,
            fontSize: 16,
            fontWeight: 500,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <AddAssetsCard />
        </div>
        <div
          style={{
            flex: 1,
            color: theme.custom.colors.background,
            fontSize: 16,
            fontWeight: 500,
            display: "flex",
            justifyContent: "center",
          }}
        ></div>
      </div>
    </div>
  );
}

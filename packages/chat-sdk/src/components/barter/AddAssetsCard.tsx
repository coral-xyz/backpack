import { useCustomTheme } from "@coral-xyz/themes";

import { useBarterContext } from "./BarterContext";

export const AddAssetsCard = () => {
  const { setSelectNft } = useBarterContext();
  const theme = useCustomTheme();
  return (
    <div
      onClick={() => {
        setSelectNft(true);
      }}
      style={{
        cursor: "pointer",
        background: theme.custom.colors.background,
        color: theme.custom.colors.fontColor,
        width: 100,
        height: 100,
      }}
    >
      + Add assets
    </div>
  );
};

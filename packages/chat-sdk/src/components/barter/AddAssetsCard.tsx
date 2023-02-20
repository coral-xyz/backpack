import { useBreakpoints } from "@coral-xyz/react-common";
import { useCustomTheme } from "@coral-xyz/themes";
import AddIcon from "@mui/icons-material/Add";

import { useBarterContext } from "./BarterContext";

export const AddAssetsCard = () => {
  const { setSelectNft } = useBarterContext();
  const theme = useCustomTheme();
  const { isXs } = useBreakpoints();
  const getDimensions = () => {
    if (isXs) {
      return 140;
    }
    return 170;
  };

  return (
    <div
      onClick={() => {
        setSelectNft(true);
      }}
      style={{
        cursor: "pointer",
        background: theme.custom.colors.invertedBg4,
        color: theme.custom.colors.icon,
        width: getDimensions(),
        height: getDimensions(),
        justifyContent: "center",
        textAlign: "center",
        fontSize: 16,
        borderRadius: 8,
        margin: isXs ? 4 : 12,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <div style={{ display: "inline-flex", justifyContent: "center" }}>
          <AddIcon />
          <div>Add assets</div>
        </div>
      </div>
    </div>
  );
};

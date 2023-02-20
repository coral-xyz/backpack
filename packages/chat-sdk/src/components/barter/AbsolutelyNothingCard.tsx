import { useBreakpoints } from "@coral-xyz/react-common";
import { useCustomTheme } from "@coral-xyz/themes";

export const AbsolutelyNothingCard = () => {
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
      style={{
        color: theme.custom.colors.icon,
        width: getDimensions(),
        height: getDimensions(),
        justifyContent: "center",
        textAlign: "center",
        fontSize: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          height: "100%",
          border: `2px solid ${theme.custom.colors.icon}`,
          borderRadius: 8,
        }}
      >
        <div style={{ display: "inline-flex", justifyContent: "center" }}>
          Absolutely nothing!
        </div>
      </div>
    </div>
  );
};

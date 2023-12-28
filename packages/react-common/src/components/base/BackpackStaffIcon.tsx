import { useTheme } from "@coral-xyz/tamagui";
import VerifiedIcon from "@mui/icons-material/Verified";
import { Tooltip } from "@mui/material";
import { styled } from "@mui/system";

export const BackpackStaffIcon = () => {
  const theme = useTheme();

  const StyledHomeIcon = styled(VerifiedIcon, {
    name: "StyledHomeIcon",
    slot: "Wrapper",
  })({
    color: theme.accentBlue.val,
    "&:hover": { color: theme.accentBlue.val },
  });

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      {" "}
      <Tooltip title="Backpack staff">
        <StyledHomeIcon
          style={{
            fontSize: 14,
            marginLeft: 3,
          }}
        />
      </Tooltip>
    </div>
  );
};

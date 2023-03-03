import { useCustomTheme } from "@coral-xyz/themes";
import VerifiedIcon from "@mui/icons-material/Verified";
import { Tooltip } from "@mui/material";
import { styled } from "@mui/system";

export const BackpackStaffIcon = () => {
  const theme = useCustomTheme();

  const StyledHomeIcon = styled(VerifiedIcon, {
    name: "StyledHomeIcon",
    slot: "Wrapper",
  })({
    color: theme.custom.colors.verified,
    "&:hover": { color: theme.custom.colors.linkColor },
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

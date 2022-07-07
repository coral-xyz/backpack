import { useState } from "react";
import { IconButton } from "@mui/material";
import { Timeline } from "@mui/icons-material";
import { useCustomTheme } from "@coral-xyz/themes";
import { WithEphemeralNavDrawer } from "../Layout/Drawer";

export function PriceButton() {
  const theme = useCustomTheme();
  const [openDrawer, setOpenDrawer] = useState(false);
  return (
    <>
      <IconButton
        onClick={() => setOpenDrawer(true)}
        disableRipple
        style={{
          padding: 0,
        }}
      >
        <Timeline
          style={{
            color: theme.custom.colors.secondary,
          }}
        />
      </IconButton>
      <WithEphemeralNavDrawer
        openDrawer={openDrawer}
        setOpenDrawer={setOpenDrawer}
        isLeft
      >
        <Prices />
      </WithEphemeralNavDrawer>
    </>
  );
}

function Prices() {
  return (
    <div
      style={
        {
          //			width: '100vw',
        }
      }
    >
      asdf prices
    </div>
  );
}

import { useState } from "react";
import { temporarilyMakeStylesForBrowserExtension } from "@coral-xyz/tamagui";
import { Typography } from "@mui/material";

import { Button } from "../../../../plugin/Component";
import { CloseButton, WithDrawer } from "../../../common/Layout/Drawer";
import {
  NavStackEphemeral,
  NavStackScreen,
} from "../../../common/Layout/NavStack";

const useStyles = temporarilyMakeStylesForBrowserExtension((theme) => ({
  headerButtonLabel: {
    color: theme.custom.colors.fontColor,
    fontSize: "14px",
    lineHeight: "24px",
    fontWeight: 500,
  },
}));

export function WithHeaderButton({
  style,
  labelComponent,
  label,
  routes,
}: any) {
  const classes = useStyles();
  const [openDrawer, setOpenDrawer] = useState(false);
  const initialRoute = routes[0];
  return (
    <>
      <Button style={style} onClick={() => setOpenDrawer(true)}>
        {labelComponent ? (
          labelComponent
        ) : (
          <Typography className={classes.headerButtonLabel}>{label}</Typography>
        )}
      </Button>
      <WithDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer}>
        <div style={{ height: "100%" }}>
          <NavStackEphemeral
            initialRoute={initialRoute}
            options={(args) => routeOptions(routes, args)}
            navButtonLeft={<CloseButton onClick={() => setOpenDrawer(false)} />}
          >
            {routes.map((r: any) => (
              <NavStackScreen
                key={r.name}
                name={r.name}
                component={r.component}
              />
            ))}
          </NavStackEphemeral>
        </div>
      </WithDrawer>
    </>
  );
}

function routeOptions(
  routes: Array<{ title: string; name: string }>,
  { route }: { route: { name: string; props?: any } }
) {
  const found = routes.find((r) => r.name === route.name);
  if (!found) {
    throw new Error("route not found");
  }
  return {
    title: found.title,
  };
}

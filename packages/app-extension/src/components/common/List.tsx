import {
  Divider,
  List as MuiList,
  ListItem as MuiListItem,
} from "@mui/material";
import { ChevronRight, CallMade, Launch } from "@mui/icons-material";
import { styles, useCustomTheme } from "@coral-xyz/themes";

const useStyles = styles(() => ({
  settingsContentListItem: {
    padding: "8px",
    height: "56px",
    display: "flex",
  },
}));

export function List({ style, children }: any) {
  const theme = useCustomTheme();
  return (
    <MuiList
      style={{
        color: theme.custom.colors.fontColor,
        background: theme.custom.colors.nav,
        padding: 0,
        marginLeft: "16px",
        marginRight: "16px",
        borderRadius: "8px",
        ...style,
      }}
    >
      {children}
    </MuiList>
  );
}

export function ListItem({
  key,
  style,
  children,
  isLast,
  id,
  onClick = undefined,
  button = true,
  borderColor,
  detail,
}: any) {
  const classes = useStyles();
  const theme = useCustomTheme();
  return (
    <>
      <MuiListItem
        data-testid={id}
        key={key}
        button={button}
        className={classes.settingsContentListItem}
        onClick={onClick}
        style={{
          ...style,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flex: 1,
          }}
        >
          {children}
        </div>
        {detail}
      </MuiListItem>
      {!isLast && (
        <Divider
          style={{
            backgroundColor: borderColor
              ? borderColor
              : theme.custom.colors.border,
            height: "1px",
          }}
        />
      )}
    </>
  );
}

export function PushDetail() {
  const theme = useCustomTheme();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <ChevronRight
        style={{
          color: theme.custom.colors.secondary,
        }}
      />
    </div>
  );
}

export function LaunchDetail() {
  const theme = useCustomTheme();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <CallMade
        style={{
          color: theme.custom.colors.secondary,
        }}
      />
    </div>
  );
}

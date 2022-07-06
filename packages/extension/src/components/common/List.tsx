import {
  Divider,
  List as MuiList,
  ListItem as MuiListItem,
} from "@mui/material";
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
        {children}
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

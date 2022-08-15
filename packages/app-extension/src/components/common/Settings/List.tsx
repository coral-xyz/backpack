import { ListItemText } from "@mui/material";
import { List, ListItem, PushDetail } from "../../common";

export function SettingsList({
  style,
  menuItems,
  textStyle,
}: {
  style?: React.CSSProperties;
  textStyle?: React.CSSProperties;
  menuItems: {
    [key: string]: {
      onClick: () => void;
      detail?: React.ReactNode;
      style?: React.CSSProperties;
      classes?: any;
      button?: boolean;
    };
  };
}) {
  return (
    <List style={{ marginTop: "16px", ...style }}>
      {Object.entries(menuItems).map(([key, val]: any, i, { length }) => (
        <ListItem
          key={key}
          id={key}
          isFirst={i === 0}
          isLast={i === length - 1}
          onClick={() => val.onClick()}
          style={{
            height: "44px",
            padding: "10px",
            ...val.style,
          }}
          button={val.button === undefined ? true : val.button}
          classes={val.classes}
          detail={val.detail ?? <PushDetail />}
        >
          <ListItemText style={{ fontWeight: 500, ...textStyle }}>
            {key}
          </ListItemText>
        </ListItem>
      ))}
    </List>
  );
}

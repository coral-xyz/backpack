import { ListItemText } from "@mui/material";
import { List, ListItem, PushDetail } from "../../common";

export function SettingsList({
  style,
  menuItems,
}: {
  style?: React.CSSProperties;
  menuItems: {
    [key: string]: { onClick: () => void; detail?: React.ReactNode };
  };
}) {
  return (
    <List style={{ marginTop: "16px", ...style }}>
      {Object.entries(menuItems).map(([key, val]: any, i, { length }) => (
        <ListItem
          key={key}
          id={key}
          isLast={i === length - 1}
          onClick={() => val.onClick()}
          style={{
            height: "44px",
            padding: "10px",
          }}
          detail={val.detail ?? <PushDetail />}
        >
          <ListItemText style={{ fontWeight: 500 }}>{key}</ListItemText>
        </ListItem>
      ))}
    </List>
  );
}

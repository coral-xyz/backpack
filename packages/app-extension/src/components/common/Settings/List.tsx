import { List, ListItem, PushDetail } from "@coral-xyz/react-common";
import { useTheme } from "@coral-xyz/tamagui";
import { Typography } from "@mui/material";

export function SettingsList({
  style,
  menuItems,
  textStyle,
  borderColor,
  className,
}: {
  style?: React.CSSProperties;
  textStyle?: React.CSSProperties;
  borderColor?: string;
  menuItems: {
    [key: string]: {
      onClick: () => void;
      detail?: React.ReactNode;
      style?: React.CSSProperties;
      classes?: any;
      button?: boolean;
      icon?: any;
      label?: string;
      allowOnclickPropagation?: boolean;
    };
  };
  className?: string;
}) {
  const theme = useTheme();
  return (
    <List
      className={className}
      style={{
        border: `${theme.baseBorderLight.val}`,
        borderRadius: "12px",
        marginTop: "16px",
        ...style,
      }}
    >
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
          detail={
            val.detail ? (
              val.detail
            ) : val.detail !== null ? (
              <PushDetail />
            ) : null
          }
          borderColor={borderColor}
          backgroundColor={theme.baseBackgroundL1.val}
          allowOnclickPropagation={val.allowOnclickPropagation}
        >
          <div
            style={{
              display: "flex",
              flex: 1,
              alignItems: "center",
            }}
          >
            {val.icon
              ? val.icon({
                  style: {
                    color: theme.baseIcon.val,
                    height: "24px",
                    width: "24px",
                    marginRight: "8px",
                  },
                  fill: theme.baseIcon.val,
                })
              : null}
            <Typography style={{ fontWeight: 500, ...textStyle }}>
              {val.label ?? key}
            </Typography>
          </div>
        </ListItem>
      ))}
    </List>
  );
}

import { View } from "../elements";
import { useTheme } from "../Context";

export function List({ children, style }) {
  const theme = useTheme();
  const isArray = children && children.length !== undefined;
  const childrenArray = isArray ? children : [children];
  const newChildrenArray: Array<React.ReactNode> = [];
  children.forEach((c, idx) => {
    newChildrenArray.push(c);
    if (idx !== childrenArray.length - 1) {
      newChildrenArray.push(<Divider />);
    }
  });
  return (
    <View
      style={{
        borderRadius: "12px",
        backgroundColor: theme.custom.colors.nav,
        ...style,
      }}
    >
      {newChildrenArray}
    </View>
  );
}

export function ListItem({ children, style }) {
  return (
    <View
      style={{
        height: "44px",
        backgroundColor: "transparent",
        ...style,
      }}
    >
      {children}
    </View>
  );
}

function Divider() {
  const theme = useTheme();
  return (
    <View
      style={{
        height: "1px",
        backgroundColor: theme.custom.colors.border,
      }}
    ></View>
  );
}

import { isFirstLastListItemStyle } from "@coral-xyz/react-common";
import { useCustomTheme } from "@coral-xyz/themes";
import { List, ListItem, Skeleton } from "@mui/material";

export function MessagesSkeleton() {
  const theme = useCustomTheme();

  return (
    <>
      <List
        style={{
          paddingTop: 0,
          paddingBottom: 0,
          borderRadius: "14px",
          border: `${theme.custom.colors.borderFull}`,
        }}
      >
        <MessageSkeleton isFirst={true} isLast={false} />
        <MessageSkeleton isFirst={false} isLast={false} />
        <MessageSkeleton isFirst={false} isLast={false} />
        <MessageSkeleton isFirst={false} isLast={true} />
      </List>
    </>
  );
}

function MessageSkeleton({ isFirst, isLast }: any) {
  const theme = useCustomTheme();
  return (
    <ListItem
      button
      disableRipple
      onClick={() => {}}
      style={{
        paddingLeft: "12px",
        paddingRight: "12px",
        paddingTop: "10px",
        paddingBottom: "10px",
        display: "flex",
        height: "68px",
        backgroundColor: theme.custom.colors.nav,
        borderBottom: isLast
          ? undefined
          : `solid 1pt ${theme.custom.colors.border}`,
        ...isFirstLastListItemStyle(isFirst, isLast, 12),
      }}
    >
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div style={{ width: 40 }}>
          <Skeleton variant="circular" width={40} height={40} />
        </div>
        <div style={{ marginLeft: "5px", width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Skeleton width="40%" height={20} style={{ marginTop: "-6px" }} />
            <Skeleton width={30} height={20} style={{ marginTop: "-6px" }} />
          </div>
          <Skeleton width="70%" height={20} style={{ marginTop: "-6px" }} />
        </div>
      </div>
    </ListItem>
  );
}

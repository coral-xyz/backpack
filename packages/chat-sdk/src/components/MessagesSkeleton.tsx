import { useCustomTheme } from "@coral-xyz/themes";
import { List, ListItem, Skeleton } from "@mui/material";

export function MessagesSkeleton() {
  const theme = useCustomTheme();

  return (
    <>
      <MessageSkeleton />
      <MessageSkeleton />
      <MessageSkeleton />
      <MessageSkeleton />
    </>
  );
}

function MessageSkeleton() {
  const theme = useCustomTheme();
  return (
    <div
      onClick={() => {}}
      style={{
        paddingLeft: "12px",
        paddingRight: "12px",
        paddingTop: "10px",
        paddingBottom: "10px",
        display: "flex",
        height: "68px",
        backgroundColor: theme.custom.colors.nav,
        marginBottom: 10,
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
        <Skeleton variant="circular" width={40} height={40} />
        <div style={{ marginLeft: "5px", width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Skeleton width="40%" height={20} style={{ marginTop: "-6px" }} />
            <Skeleton width={30} height={20} style={{ marginTop: "-6px" }} />
          </div>
          <Skeleton width="70%" height={20} style={{ marginTop: "-6px" }} />
        </div>
      </div>
    </div>
  );
}

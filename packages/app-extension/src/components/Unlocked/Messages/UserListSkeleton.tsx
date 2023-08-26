import { useCustomTheme } from "@coral-xyz/themes";
import { Skeleton } from "@mui/material";

export function UserListSkeleton() {
  return (
    <>
      <UserSkeleton />
      <UserSkeleton />
      <UserSkeleton />
      <UserSkeleton />
    </>
  );
}

function UserSkeleton() {
  const theme = useCustomTheme();
  return (
    <div
      onClick={() => {}}
      style={{
        paddingLeft: "19px",
        paddingRight: "19px",
        paddingTop: "10px",
        paddingBottom: "10px",
        display: "flex",
        height: "38px",
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
        <div style={{ width: 50 }}>
          <Skeleton variant="circular" width={40} height={40} />
        </div>
        <div style={{ marginLeft: "5px", width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Skeleton width="40%" height={20} style={{ marginTop: "-6px" }} />
          </div>
          <Skeleton width="80%" height={20} style={{ marginTop: "-6px" }} />
        </div>
      </div>
    </div>
  );
}

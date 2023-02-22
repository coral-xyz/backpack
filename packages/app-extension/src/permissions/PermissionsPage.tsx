export const PermissionsPage = ({
  permissionGranted,
  inProgress,
}: {
  permissionGranted: boolean;
  inProgress: boolean;
}) => {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background:
          "radial-gradient(farthest-side at 0 0, #6360FF, rgba(255,255,255,0) 100%),radial-gradient(farthest-side at 100% 0, #C061F7, rgba(255,255,255,0) 100%),radial-gradient(farthest-side at 0 100%, #28DBD1 25%, rgba(255,255,255,0) 100%),radial-gradient(farthest-side at 100% 100%, #FE6F5C 25%, rgba(255,255,255,0) 100%)",
      }}
    >
      {inProgress ? (
        <img
          src="/assets/will.png"
          style={{
            transform: "rotate(10deg) scaleX(-1)",
            marginLeft: 350,
            maxHeight: "90vh",
          }}
        />
      ) : null}
      <div>
        {permissionGranted ? (
          <div style={{ fontSize: 50, paddingTop: "45vh" }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div>
                <div>Permissions granted</div>
              </div>
            </div>
          </div>
        ) : null}
        {!permissionGranted ? (
          <div style={{ fontSize: 50, paddingTop: "45vh" }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div>
                <div>Permissions rejected</div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

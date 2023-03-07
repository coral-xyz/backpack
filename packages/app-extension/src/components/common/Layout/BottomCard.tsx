import { PrimaryButton, SecondaryButton } from "@coral-xyz/react-common";
import { useCustomTheme } from "@coral-xyz/themes";

export function BottomCard({
  onButtonClick,
  onCancelButtonClick,
  buttonLabel,
  buttonStyle,
  buttonLabelStyle,
  cancelButtonLabel,
  cancelButtonStyle,
  cancelButtonLabelStyle,
  children,
  topHalfStyle,
  wrapperStyle,
}: any) {
  const theme = useCustomTheme();
  return (
    <div
      style={{
        background: "transparent",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        ...wrapperStyle,
      }}
    >
      <div
        style={{
          height: "100%",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: theme.custom.colors.background,
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
        }}
      >
        <div
          style={{
            flex: 1,
            background: theme.custom.colors.drawerGradient,
            ...topHalfStyle,
          }}
        >
          {children}
        </div>
        <div
          style={{
            marginBottom: "24px",
            marginLeft: "12px",
            marginRight: "12px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {cancelButtonLabel ? (
            <SecondaryButton
              style={{
                marginRight: "8px",
                ...cancelButtonStyle,
              }}
              buttonLabelStyle={cancelButtonLabelStyle}
              onClick={onCancelButtonClick}
              label={cancelButtonLabel}
            />
          ) : null}
          {buttonLabel ? (
            <PrimaryButton
              style={buttonStyle}
              buttonLabelStyle={buttonLabelStyle}
              onClick={onButtonClick}
              label={buttonLabel}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

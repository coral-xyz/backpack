import { Suspense } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { ArrowBack } from "@mui/icons-material";
import { Scrollbar } from "./Scrollbar";
import { Loading } from "../common";
import { Router } from "./Router";

export const NAV_BAR_HEIGHT = 56;
export const NAV_BUTTON_WIDTH = 38;

const useStyles = styles((theme) => ({
  menuButtonContainer: {
    width: `${NAV_BUTTON_WIDTH}px`,
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
  },
  overviewLabel: {
    fontSize: "inherit",
    fontWeight: 500,
    color: theme.custom.colors.fontColor,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    textAlign: "center",
    lineHeight: "24px",
  },
  overviewLabelPrefix: {
    color: theme.custom.colors.secondary,
  },
  backButton: {
    padding: 0,
    position: "absolute",
    left: 0,
    "&:hover": {
      background: "transparent",
    },
  },
}));

export function WithNav({
  title,
  navButtonLeft,
  navButtonRight,
  children,
  navbarStyle = {},
  navContentStyle = {},
}: {
  title?: string;
  navButtonLeft?: React.ReactNode;
  navButtonRight?: React.ReactNode;
  children?: React.ReactNode;
  navbarStyle?: React.CSSProperties;
  navContentStyle?: React.CSSProperties;
}) {
  return (
    <>
      <NavBar
        title={title || ""}
        navButtonLeft={navButtonLeft}
        navButtonRight={navButtonRight}
        style={navbarStyle}
      />
      <NavContent style={navContentStyle} renderComponent={children} />
    </>
  );
}

export function NavBar({
  title,
  navButtonLeft,
  navButtonRight,
  style = {},
}: {
  title: string;
  navButtonLeft: React.ReactNode;
  navButtonRight: React.ReactNode;
  style?: any;
}) {
  return (
    <Suspense fallback={null}>
      <div
        style={{
          display: "flex",
          height: `${NAV_BAR_HEIGHT}px`,
          position: "relative",
          justifyContent: "space-between",
          padding: "10px 16px",
          ...style,
        }}
      >
        <div style={{ position: "relative", width: "100%", display: "flex" }}>
          <NavButton button={navButtonLeft} />
          <CenterDisplay title={title} />
          <NavButton button={navButtonRight} align="right" />
        </div>
      </div>
    </Suspense>
  );
}

function NavButton({
  button,
  align = "left",
}: {
  button: React.ReactNode;
  align?: "left" | "right";
}) {
  const alignment = { [align]: 0 };
  return (
    <div
      style={{
        position: "absolute",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        ...alignment,
      }}
    >
      {button ? button : <DummyButton />}
    </div>
  );
}

export function NavBackButton({ onClick }: { onClick: () => void }) {
  const classes = useStyles();
  const theme = useCustomTheme();
  return (
    <div
      style={{
        width: `${NAV_BUTTON_WIDTH}px`,
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <IconButton
        disableRipple
        onClick={onClick}
        className={classes.backButton}
        size="large"
        data-testid="back-button"
      >
        <ArrowBack style={{ color: theme.custom.colors.secondary }} />
      </IconButton>
    </div>
  );
}

export function NavContent({
  renderComponent = <Router />,
  style,
}: {
  renderComponent?: React.ReactNode;
  style?: any;
}) {
  const _style = {
    flex: 1,
    ...style,
  };
  return (
    <div style={_style}>
      <Scrollbar>
        <Suspense fallback={<Loading />}>{renderComponent}</Suspense>
      </Scrollbar>
    </div>
  );
}

function CenterDisplay({ title }: { title: string }) {
  return (
    <Suspense fallback={<div></div>}>
      <div
        style={{
          visibility: title ? undefined : "hidden",
          overflow: "hidden",
          maxWidth: `calc(100% - ${NAV_BUTTON_WIDTH * 2}px)`,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
        }}
      >
        <NavTitleLabel title={title} />
      </div>
    </Suspense>
  );
}

export function NavTitleLabel({ title }: any) {
  const classes = useStyles();
  const titleComponents = title.split("/");
  return titleComponents.length === 2 ? (
    <Typography className={classes.overviewLabel} title={title}>
      <span className={classes.overviewLabelPrefix}>
        {titleComponents[0]} /
      </span>
      {titleComponents[1]}
    </Typography>
  ) : (
    <Typography className={classes.overviewLabel} title={title}>
      {title}
    </Typography>
  );
}

export function DummyButton() {
  const classes = useStyles();
  return <div className={classes.menuButtonContainer}></div>;
}

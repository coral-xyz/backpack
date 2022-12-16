import React, { Suspense, useState } from "react";
import { Loading } from "@coral-xyz/react-common";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { ArrowBack } from "@mui/icons-material";
import KeyboardArrowDownSharpIcon from "@mui/icons-material/KeyboardArrowDownSharp";
import { IconButton, Typography } from "@mui/material";

import { Scrollbar } from "./Scrollbar";

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
    fontSize: "18px",
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
  notchViewComponent,
  noScrollbars,
}: {
  title?: string;
  navButtonLeft?: React.ReactNode;
  navButtonRight?: React.ReactNode;
  children?: React.ReactNode;
  navbarStyle?: React.CSSProperties;
  navContentStyle?: React.CSSProperties;
  notchViewComponent?: React.ReactElement | null;
  noScrollbars?: boolean;
}) {
  return (
    <>
      <NavBar
        notchViewComponent={notchViewComponent}
        title={title || ""}
        navButtonLeft={navButtonLeft}
        navButtonRight={navButtonRight}
        style={navbarStyle}
      />
      <NavContent
        style={navContentStyle}
        noScrollbars={noScrollbars}
        renderComponent={children}
      />
    </>
  );
}

export function NavBar({
  title,
  navButtonLeft,
  navButtonRight,
  style = {},
  notchViewComponent,
}: {
  title: string;
  navButtonLeft: React.ReactNode;
  navButtonRight: React.ReactNode;
  style?: any;
  notchViewComponent?: React.ReactElement | null;
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
          <CenterDisplay
            title={title}
            notchViewComponent={notchViewComponent}
          />
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
        <ArrowBack style={{ color: theme.custom.colors.icon }} />
      </IconButton>
    </div>
  );
}

export function NavContent({
  renderComponent,
  style,
  noScrollbars,
}: {
  renderComponent?: React.ReactNode;
  noScrollbars?: boolean;
  style?: any;
}) {
  const _style = {
    flex: 1,
    ...style,
  };

  return (
    <div className="nav-content-style" style={_style}>
      {noScrollbars ? (
        <Suspense fallback={<Loading />}>{renderComponent}</Suspense>
      ) : (
        <Scrollbar>
          <Suspense fallback={<Loading />}>{renderComponent}</Suspense>
        </Scrollbar>
      )}
    </div>
  );
}

function CenterDisplay({
  title,
  notchViewComponent,
}: {
  title: string;
  notchViewComponent?: React.ReactElement | null;
}) {
  const [notchEnabled, setNotchEnabled] = useState(false);
  const notchViewComponentWithProps = notchViewComponent
    ? React.cloneElement(notchViewComponent, { setOpenDrawer: setNotchEnabled })
    : null;
  const theme = useCustomTheme();

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
        {notchViewComponent && (
          <KeyboardArrowDownSharpIcon
            onClick={() => setNotchEnabled((x) => !x)}
            style={{ cursor: "pointer", color: theme.custom.colors.fontColor }}
          />
        )}
        {notchEnabled && notchViewComponentWithProps && (
          <>{notchViewComponentWithProps}</>
        )}
      </div>
    </Suspense>
  );
}

export function NavTitleLabel({ title }: any) {
  const classes = useStyles();
  if (typeof title !== "string") {
    return title;
  }
  const slashTitleComponents = title.split("/");
  const parenComponents = title.split("(");
  return slashTitleComponents.length === 2 ? (
    <Typography className={classes.overviewLabel} title={title}>
      <span className={classes.overviewLabelPrefix}>
        {slashTitleComponents[0]} /
      </span>
      {slashTitleComponents[1]}
    </Typography>
  ) : parenComponents.length === 2 ? (
    <Typography className={classes.overviewLabel} title={title}>
      {parenComponents[0]}
      <span className={classes.overviewLabelPrefix}>({parenComponents[1]}</span>
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

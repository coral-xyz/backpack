import { cloneElement, useState } from "react";
import { LocalImage } from "@coral-xyz/react-common";
import {
  temporarilyMakeStylesForBrowserExtension,
  useTheme,
} from "@coral-xyz/tamagui";
import { ArrowBack } from "@mui/icons-material";
import KeyboardArrowDownSharpIcon from "@mui/icons-material/KeyboardArrowDownSharp";
import VerifiedIcon from "@mui/icons-material/Verified";
import { IconButton, Typography } from "@mui/material";

import { Scrollbar } from "./Scrollbar";

export const NAV_BAR_HEIGHT = 56;
export const NAV_BUTTON_WIDTH = 38;

const useStyles = temporarilyMakeStylesForBrowserExtension(() => ({
  menuButtonContainer: {
    width: `${NAV_BUTTON_WIDTH}px`,
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
  },
  overviewLabel: {
    fontSize: "18px",
    fontWeight: 500,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    textAlign: "center",
    lineHeight: "24px",
  },
  backButton: {
    padding: 0,
    position: "absolute",
    left: 0,
    "&:hover": {
      background: "transparent !important",
    },
  },
}));

export function WithNav({
  title,
  navButtonLeft,
  navButtonRight,
  navButtonCenter,
  children,
  navbarStyle = {},
  navContentStyle = {},
  notchViewComponent,
  noScrollbars,
  image,
  onClick,
  isVerified,
}: {
  title?: string;
  navButtonLeft?: React.ReactNode;
  navButtonRight?: React.ReactNode;
  navButtonCenter?: React.ReactNode;
  children?: React.ReactNode;
  navbarStyle?: React.CSSProperties;
  navContentStyle?: React.CSSProperties;
  notchViewComponent?: React.ReactElement | null;
  noScrollbars?: boolean;
  image?: string;
  onClick?: any;
  isVerified?: boolean;
}) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}
    >
      <NavBar
        notchViewComponent={notchViewComponent}
        title={navButtonCenter || title || ""}
        image={image}
        isVerified={isVerified}
        onClick={onClick}
        navButtonLeft={navButtonLeft}
        navButtonRight={navButtonRight}
        style={navbarStyle}
      />
      <NavContent
        style={navContentStyle}
        noScrollbars={noScrollbars}
        renderComponent={children}
      />
    </div>
  );
}

function NavBar({
  title,
  navButtonLeft,
  navButtonRight,
  style = {},
  notchViewComponent,
  image,
  onClick,
  isVerified,
}: {
  title: React.ReactNode | string;
  image?: string;
  onClick?: any;
  navButtonLeft: React.ReactNode;
  navButtonRight: React.ReactNode;
  style?: any;
  notchViewComponent?: React.ReactElement | null;
  isVerified?: boolean;
}) {
  return (
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
      <div
        style={{
          position: "relative",
          width: "100%",
          display: "flex",
          flex: 1,
        }}
      >
        <NavButton button={navButtonLeft} />
        <CenterDisplay
          image={image}
          onClick={onClick}
          isVerified={isVerified}
          title={title}
          notchViewComponent={notchViewComponent}
        />
        <NavButton button={navButtonRight} align="right" />
      </div>
    </div>
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
  const theme = useTheme();
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
        <ArrowBack style={{ color: theme.baseIcon.val }} />
      </IconButton>
    </div>
  );
}

function NavContent({
  renderComponent,
  style,
  noScrollbars,
}: {
  renderComponent?: React.ReactNode;
  noScrollbars?: boolean;
  style?: any;
}) {
  const _style = {
    position: "relative",
    display: "flex",
    flex: 1,
    flexDirection: "column",
    ...style,
  };

  return (
    <div className="nav-content-style" style={_style}>
      {noScrollbars ? (
        renderComponent
      ) : (
        <div
          style={{
            position: "absolute",
            height: "100%",
            width: "100%",
          }}
        >
          <Scrollbar>{renderComponent}</Scrollbar>
        </div>
      )}
    </div>
  );
}

function CenterDisplay({
  title,
  notchViewComponent,
  image,
  onClick,
  isVerified,
}: {
  title: React.ReactNode | string;
  notchViewComponent?: React.ReactElement | null;
  image?: string;
  onClick?: any;
  isVerified?: boolean;
}) {
  const [notchEnabled, setNotchEnabled] = useState(false);
  const notchViewComponentWithProps = notchViewComponent
    ? cloneElement(notchViewComponent, { setOpenDrawer: setNotchEnabled })
    : null;

  const theme = useTheme();
  const handleOpenDrawer = () => {
    setNotchEnabled((x) => !x);
  };

  return (
    <div
      style={{
        userSelect: "none",
        visibility: title ? undefined : "hidden",
        overflow: "hidden",
        maxWidth: `calc(100% - ${NAV_BUTTON_WIDTH * 2}px)`,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        cursor: onClick ? "pointer" : "default",
      }}
      onClick={onClick ? onClick : () => {}}
    >
      {image ? (
        <button
          style={{
            background: "transparent",
            border: "none",
            padding: 0,
            margin: 0,
            cursor: "pointer",
            width: 25,
            height: 25,
            marginRight: 5,
          }}
          onClick={handleOpenDrawer}
        >
          <LocalImage
            style={{
              width: 25,
              height: 25,
              borderRadius: "50%",
            }}
            src={image}
          />
        </button>
      ) : null}
      <button
        style={{
          background: "transparent",
          border: "none",
          padding: 0,
          margin: 0,
          cursor: notchViewComponent ? "pointer" : "default",
        }}
        onClick={handleOpenDrawer}
      >
        <NavTitleLabel title={title} />
      </button>
      {notchViewComponent ? (
        <KeyboardArrowDownSharpIcon
          onClick={handleOpenDrawer}
          style={{ cursor: "pointer", color: theme.baseTextHighEmphasis.val }}
        />
      ) : null}
      {notchEnabled && notchViewComponentWithProps ? (
        <>{notchViewComponentWithProps}</>
      ) : null}
      {isVerified ? (
        <VerifiedIcon
          style={{
            fontSize: 19,
            marginLeft: 3,
            color: theme.accentBlue.val,
          }}
        />
      ) : null}
    </div>
  );
}

function NavTitleLabel({ title }: any) {
  const classes = useStyles();
  const theme = useTheme();
  if (typeof title !== "string") {
    return title;
  }
  const slashTitleComponents = title.split("/");
  const parenComponents = title.split("(");
  return slashTitleComponents.length === 2 ? (
    <Typography
      className={classes.overviewLabel}
      sx={{ color: theme.baseTextHighEmphasis.val }}
      title={title}
    >
      <span style={{ color: theme.baseTextMedEmphasis.val }}>
        {slashTitleComponents[0]} /
      </span>
      {slashTitleComponents[1]}
    </Typography>
  ) : parenComponents.length === 2 ? (
    <Typography
      className={classes.overviewLabel}
      sx={{ color: theme.baseTextHighEmphasis.val }}
      title={title}
    >
      {parenComponents[0]}
      <span style={{ color: theme.baseTextMedEmphasis.val }}>
        {parenComponents[1]}
      </span>
    </Typography>
  ) : (
    <Typography
      className={classes.overviewLabel}
      sx={{ color: theme.baseTextHighEmphasis.val }}
      title={title}
    >
      {title}
    </Typography>
  );
}

function DummyButton() {
  const classes = useStyles();
  return <div className={classes.menuButtonContainer} />;
}

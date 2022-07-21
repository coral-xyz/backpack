import React from "react";
import { useNavStack, NavStackProvider } from "./Context";

export function NavStack({
  initialRoute,
  children,
  options,
  style,
  navButtonRight,
}: {
  initialRoute: { name: string; props?: any };
  children: any;
  options: NavStackOptions;
  style?: React.CSSProperties;
  navButtonRight?: React.ReactNode;
}) {
  const isArray = children && children.length !== undefined;
  const navScreens =
    children === undefined ? [] : isArray ? children : [children];
  return (
    <NavStackProvider
      initialRoute={initialRoute}
      style={style}
      navButtonRight={navButtonRight}
    >
      <NavStackInner navScreens={navScreens} options={options} />
    </NavStackProvider>
  );
}

function NavStackInner({
  navScreens,
  options,
}: {
  navScreens: any;
  options: NavStackOptions;
}) {
  let { isRoot, activeRoute, pop, navButtonRight, title, style, contentStyle } =
    useNavStack();

  const navButtonLeft = isRoot ? null : <NavBackButton onClick={() => pop()} />;
  const activeScreen = navScreens.find(
    (c: any) => c.props.name === activeRoute.name
  );

  let { title: titleDefault } = options({
    route: activeRoute,
  });
  if (!title) {
    title = titleDefault;
  }
  return (
    <AnimatePresence initial={false}>
      <WithMotion id={activeRoute.name} navAction={activeRoute.navAction}>
        <WithNav
          title={title}
          navButtonLeft={navButtonLeft}
          navButtonRight={navButtonRight}
          navbarStyle={style}
          navContentStyle={contentStyle}
        >
          {activeScreen.props.component({ ...(activeRoute.props ?? {}) })}
        </WithNav>
      </WithMotion>
    </AnimatePresence>
  );
}

export function NavScreen() {
  return <></>;
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

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
  renderComponent,
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

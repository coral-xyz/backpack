import React from "react";
import { useTheme } from "../../Context";
import { View, Text, Button, ScrollBar } from "../../elements";
import { useNavigation, NavStackProvider, NavStackOptions } from "./Context";
import { ArrowBack } from "../Icons";

// TODO: share this with the main app.
const NAV_BAR_HEIGHT = 56;
const NAV_BUTTON_WIDTH = 38;

export { useNavigation } from "./Context";

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
    useNavigation();

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

  console.log("active screen here", activeRoute, activeScreen);

  return (
    <WithNav
      title={title}
      navButtonLeft={navButtonLeft}
      navButtonRight={navButtonRight}
      navbarStyle={style}
      navContentStyle={contentStyle}
    >
      {activeScreen.props.component({ ...(activeRoute.props ?? {}) })}
    </WithNav>
  );
}

export function NavScreen({ component, name }: any) {
  // TODO: allow empty tags.
  return <View style={{ display: "none" }}></View>;
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function WithNav({
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
    <View style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <NavBar
        title={title || ""}
        navButtonLeft={navButtonLeft}
        navButtonRight={navButtonRight}
        style={navbarStyle}
      />
      <NavContent style={navContentStyle} renderComponent={children} />
    </View>
  );
}

function NavBar({
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
    <View
      style={{
        display: "flex",
        height: `${NAV_BAR_HEIGHT}px`,
        position: "relative",
        justifyContent: "space-between",
        padding: "10px 16px",
        ...style,
      }}
    >
      <View style={{ position: "relative", width: "100%", display: "flex" }}>
        <NavButton button={navButtonLeft} />
        <CenterDisplay title={title} />
        <NavButton button={navButtonRight} align="right" />
      </View>
    </View>
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
    <View
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
    </View>
  );
}

function NavBackButton({ onClick }: { onClick: () => void }) {
  const theme = useTheme();
  return (
    <View
      style={{
        width: `${NAV_BUTTON_WIDTH}px`,
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <Button
        onClick={onClick}
        style={{
          backgroundColor: "transparent",
          height: "24px",
          width: "24px",
          minWidth: "24px",
          padding: 0,
        }}
      >
        <ArrowBack fill={theme.custom.colors.secondary} />
      </Button>
    </View>
  );
}

function NavContent({
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
    <View style={_style}>
      <ScrollBar>{renderComponent}</ScrollBar>
    </View>
  );
}

function CenterDisplay({ title }: { title: string }) {
  return (
    <View
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
    </View>
  );
}

function NavTitleLabel({ title }: any) {
  const theme = useTheme();
  return (
    <Text
      style={{
        fontSize: "18px",
        fontWeight: 500,
        color: theme.custom.colors.fontColor,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        textAlign: "center",
        lineHeight: "24px",
      }}
    >
      {title}
    </Text>
  );
}

function DummyButton() {
  return (
    <View
      style={{
        width: `${NAV_BUTTON_WIDTH}px`,
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    ></View>
  );
}

/*
    <AnimatePresence initial={false}>
      <WithMotion id={activeRoute.name} navAction={activeRoute.navAction}>
      </WithMotion>
    </AnimatePresence>
*/

import React from "react";
import { useTheme } from "../../Context";
import { View, Text, Button, ScrollBar, NavAnimation } from "../../elements";
import { useNavigation, NavStackProvider, NavStackOptions } from "./Context";
import { ArrowBack } from "../Icons";

// TODO: share this with the main app.
const NAV_BAR_HEIGHT = 56;
const NAV_BUTTON_WIDTH = 38;

export { useNavigation } from "./Context";

export const Stack = {
  Navigator,
  Screen,
};

function Navigator({
  initialRoute,
  children,
  options,
  style,
  titleStyle,
  navButtonRight,
}: {
  initialRoute: { name: string; props?: any };
  children: any;
  options: NavStackOptions;
  style?: React.CSSProperties;
  titleStyle?: React.CSSProperties;
  navButtonRight?: React.ReactNode;
}) {
  const isArray = children && children.length !== undefined;
  const navScreens =
    children === undefined ? [] : isArray ? children : [children];
  return (
    <NavStackProvider
      initialRoute={initialRoute}
      style={style}
      titleStyle={titleStyle}
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
  let {
    isRoot,
    activeRoute,
    pop,
    navButtonRight,
    title,
    style,
    contentStyle,
    titleStyle,
  } = useNavigation();

  const navButtonLeft = isRoot ? null : <NavBackButton onClick={() => pop()} />;
  const activeScreen = navScreens.find(
    (c: any) => c.props.name === activeRoute.name
  );

  const { title: titleDefault } = options({
    route: activeRoute,
  });
  if (!title) {
    title = titleDefault;
  }

  return (
    <NavAnimation routeName={activeRoute.name} navAction={"push"}>
      <WithNav
        title={title}
        navButtonLeft={navButtonLeft}
        navButtonRight={navButtonRight}
        navbarStyle={style}
        navbarTitleStyle={titleStyle}
        navContentStyle={contentStyle}
      >
        {activeScreen.props.component({ ...(activeRoute.props ?? {}) })}
      </WithNav>
    </NavAnimation>
  );
}

function Screen({ component, name }: any) {
  // TODO: allow empty tags.
  return <View style={{ display: "none" }}></View>;
}

function WithNav({
  title,
  navButtonLeft,
  navButtonRight,
  children,
  navbarStyle = {},
  navbarTitleStyle = {},
  navContentStyle = {},
}: {
  title?: string;
  navButtonLeft?: React.ReactNode;
  navButtonRight?: React.ReactNode;
  children?: React.ReactNode;
  navbarStyle?: React.CSSProperties;
  navbarTitleStyle?: React.CSSProperties;
  navContentStyle?: React.CSSProperties;
}) {
  return (
    <View style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <NavBar
        title={title || ""}
        navButtonLeft={navButtonLeft}
        navButtonRight={navButtonRight}
        style={navbarStyle}
        titleStyle={navbarTitleStyle}
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
  titleStyle = {},
}: {
  title: string;
  navButtonLeft: React.ReactNode;
  navButtonRight: React.ReactNode;
  style?: React.CSSProperties;
  titleStyle?: React.CSSProperties;
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
        <CenterDisplay title={title} titleStyle={titleStyle} />
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

function CenterDisplay({
  title,
  titleStyle,
}: {
  title: string;
  titleStyle?: React.CSSProperties;
}) {
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
      <NavTitleLabel title={title} style={titleStyle} />
    </View>
  );
}

function NavTitleLabel({
  title,
  style,
}: {
  title?: string;
  style?: React.CSSProperties;
}) {
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
        ...style,
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

import React, { useState, useContext } from "react";
import { View, Button, ScrollBar } from "../elements";
import { useTheme } from "../Context";

export const Tab = {
  Navigator,
  Screen,
  Icon,
};

function Navigator({
  children,
  style,
  top,
  disableScroll,
  options,
}: {
  children: any;
  style: React.CSSProperties;
  top?: boolean;
  disableScroll?: boolean;
  options?: TabsOptions;
}) {
  const isArray = children && children.length !== undefined;
  const childrenArray = isArray ? children : [children];
  const initialTab = !children ? null : childrenArray[0].props.name;
  return (
    <TabProvider initialTab={initialTab} options={options}>
      {top ? (
        <View
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <TabBar tabScreens={childrenArray} style={style} />
          <TabContent
            tabScreens={childrenArray}
            disableScroll={disableScroll}
          />
        </View>
      ) : (
        <View
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <TabContent
            tabScreens={childrenArray}
            disableScroll={disableScroll}
          />
          <TabBar tabScreens={childrenArray} style={style} />
        </View>
      )}
    </TabProvider>
  );
}

function Screen({ name, component }: TabProps) {
  return <></>;
}

function TabContent({ tabScreens, disableScroll }) {
  const { activeTab } = useTabContext();
  const screen = tabScreens.find((t) => t.props.name === activeTab);
  const inner = (
    <View
      style={{
        flex: 1,
        height: "100%",
      }}
    >
      {screen.props.component()}
    </View>
  );
  return disableScroll ? inner : <ScrollBar>{inner}</ScrollBar>;
}

function TabBar({ tabScreens, style }) {
  const theme = useTheme();
  const { activeTab, options, setActiveTab } = useTabContext();
  return (
    <View
      style={{
        display: "flex",
        width: "100%",
        backgroundColor: theme.custom.colors.nav,
        height: "64px",
        borderTop: `solid 1pt ${theme.custom.colors.border}`,
        ...style,
      }}
    >
      {tabScreens.map((screen) => {
        const routedOptions = options({ route: { name: screen.props.name } });
        const focused = activeTab === screen.props.name;
        const color = focused
          ? routedOptions.tabBarActiveTintColor
          : routedOptions.tabBarInactiveTintColor;
        return (
          <Button
            key={screen.props.name}
            style={{
              padding: 0,
              height: "100%",
              flex: 1,
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              background: "transparent",
              borderRadius: 0,
              position: "relative",
              ...routedOptions.tabBarStyle,
            }}
            onClick={() => setActiveTab(screen.props.name)}
          >
            <View style={{ width: "100%", height: "100%" }}>
              {routedOptions.tabBarIcon({ focused })}
            </View>
            <View
              style={{
                position: "absolute",
                height: "2px",
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: color,
              }}
            ></View>
          </Button>
        );
      })}
    </View>
  );
}

type TabProps = {
  component: () => React.ReactNode;
  name: string;
  disableLabel?: boolean;
};

type TabsOptions = ({ route }) => RoutedTabsOptions;

type RoutedTabsOptions = {
  tabBarIcon: ({ focused }: { focused: boolean }) => React.ReactNode;
  tabBarActiveTintColor: string;
  tabBarInactiveTintColor: string;
  tabBarStyle?: React.CSSProperties;
};

type TabContext = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  options: TabsOptions;
};

const _TabContext = React.createContext<TabContext | null>(null);

function TabProvider({ initialTab, options, children }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  return (
    <_TabContext.Provider
      value={{
        activeTab,
        setActiveTab,
        options,
      }}
    >
      {children}
    </_TabContext.Provider>
  );
}

export function useTabContext(): TabContext {
  const ctx = useContext(_TabContext);
  if (ctx === null) {
    throw new Error("Context not available");
  }
  return ctx;
}

function Icon({ element }) {
  return (
    <View
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: "25px",
          height: "25px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {element}
      </View>
    </View>
  );
}

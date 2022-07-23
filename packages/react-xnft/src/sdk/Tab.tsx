import React, { useState, useContext } from "react";
import { View, Button, Text, ScrollBar } from "../elements";
import { useTheme } from "../Context";

export const Tab = {
  Navigator,
  Screen,
};

function Navigator({
  children,
  style,
  options,
}: {
  children: any;
  style: React.CSSProperties;
  options?: TabsOptions;
}) {
  const isArray = children && children.length !== undefined;
  const childrenArray = isArray ? children : [children];
  const initialTab = !children ? null : childrenArray[0].props.name;

  return (
    <TabProvider initialTab={initialTab} options={options}>
      <View
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TabContent tabScreens={childrenArray} />
        <TabBar tabScreens={childrenArray} style={style} />
      </View>
    </TabProvider>
  );
}

function Screen({ name, component }: TabProps) {
  return <></>;
}

function TabContent({ tabScreens }) {
  const { activeTab } = useTabContext();
  const screen = tabScreens.find((t) => t.props.name === activeTab);
  return (
    <ScrollBar>
      <View
        style={{
          flex: 1,
          height: "100%",
        }}
      >
        {screen.props.component()}
      </View>
    </ScrollBar>
  );
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
            }}
            onClick={() => setActiveTab(screen.props.name)}
          >
            <View>
              <View
                style={{
                  width: "25px",
                  height: "25px",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                {routedOptions.tabBarIcon({ focused })}
              </View>
              {!screen.props.disableLabel && (
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: "9px",
                    fontWeight: 400,
                    color: focused
                      ? routedOptions.tabBarActiveTintColor
                      : routedOptions.tabBarInactiveTintColor,
                  }}
                >
                  {screen.props.name}
                </Text>
              )}
            </View>
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

function useTabContext(): TabContext {
  const ctx = useContext(_TabContext);
  if (ctx === null) {
    throw new Error("Context not available");
  }
  return ctx;
}

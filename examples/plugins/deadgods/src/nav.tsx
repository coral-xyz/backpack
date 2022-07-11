import React, { useState, useContext } from "react";
import { useTheme, View, Button } from "@coral-xyz/anchor-ui";

export function Tabs({
  children,
  style,
  options,
}: {
  children: any;
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

export function Tab({ name, component }: TabProps) {
  return <></>;
}

function TabContent({ tabScreens }) {
  const { activeTab } = useTabContext();
  const screen = tabScreens.find((t) => t.props.name === activeTab);
  return (
    <View
      style={{
        flex: 1,
      }}
    >
      {screen.props.component()}
    </View>
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
            style={{
              padding: 0,
              height: "100%",
              flex: 1,
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
            }}
            onClick={() => setActiveTab(screen.props.name)}
          >
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
          </Button>
        );
      })}
    </View>
  );
}

type TabProps = {
  component: () => React.ReactNode;
  name: string;
};

type TabsOptions = ({ route }) => RoutedTabsOptions;

type RoutedTabsOptions = {
  tabBarIcon: ({ focused }: { focused: boolean }) => React.ReactNode;
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

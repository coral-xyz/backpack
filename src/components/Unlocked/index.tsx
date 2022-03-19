import { useTab } from "../../hooks/useTab";
import { Balances } from "./Balances";
import { Quests } from "./Quests";
import { Bridge } from "./Bridge";
import { Settings } from "./Settings";
import { useBootstrap, useBackgroundPoll } from "../../hooks/useWallet";
import { WithNav } from "../Layout/Nav";
import { TAB_BALANCES, TAB_BRIDGE, TAB_QUEST, TAB_FRIENDS } from "../../common";
import { WithTabs } from "../Layout/Tab";

export function Unlocked() {
  useBackgroundPoll();
  const { tab } = useTab();
  return (
    <WithTabs>
      {tab === TAB_BALANCES && (
        <WithNavBootstrap>
          <Balances />
        </WithNavBootstrap>
      )}
      {tab === TAB_QUEST && (
        <WithNavBootstrap>
          <Quests />
        </WithNavBootstrap>
      )}
      {tab === TAB_BRIDGE && (
        <WithNavBootstrap>
          <Bridge />
        </WithNavBootstrap>
      )}
      {tab === TAB_FRIENDS && (
        <WithNavBootstrap>
          <Settings />
        </WithNavBootstrap>
      )}
    </WithTabs>
  );
}

function WithNavBootstrap({ children }: any) {
  return (
    <WithNav>
      <_WithBootstrap>{children}</_WithBootstrap>
    </WithNav>
  );
}

function _WithBootstrap(props: any) {
  useBootstrap();
  return <>{props.children}</>;
}

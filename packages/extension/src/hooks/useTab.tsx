import { useRecoilState } from "recoil";
import { navigationActiveTab } from "../recoil/atoms";

type TabContext = {
  tab: string;
  setTab: (tab: string) => void;
};

export function useTab(): TabContext {
  const [tab, setTab] = useRecoilState(navigationActiveTab);
  return {
    tab: tab!,
    setTab,
  };
}

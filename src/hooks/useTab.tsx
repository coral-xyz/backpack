import * as atoms from "../recoil/atoms";
import { useRecoilState } from "recoil";

type TabContext = {
  tab: string;
  setTab: (tab: string) => void;
};

export function useTab(): TabContext {
  const [tab, setTab] = useRecoilState(atoms.navigationActiveTab);
  return {
    tab: tab!,
    setTab,
  };
}

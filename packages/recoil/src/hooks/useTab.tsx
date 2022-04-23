import { useRecoilState } from "recoil";
import * as atoms from "../atoms";

type TabContext = {
  tab: string;
  setTab: (tab: string) => void;
};

export function useTab(): TabContext {
  const [tab, setTab] = useRecoilState(atoms.navigationActiveTab);
  return {
    tab: tab! as string, // ts wtf?
    setTab,
  };
}

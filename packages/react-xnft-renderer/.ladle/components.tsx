import {
  ActionType,
  GlobalProvider,
  ThemeState,
  useLadleContext,
} from "@ladle/react";
import { WithTheme } from "@coral-xyz/themes";
import { RecoilRoot } from "recoil";
import { useEffect } from "react";
import "./ladle.css";

export const Provider: GlobalProvider = ({ children, globalState }) => {
  const { dispatch } = useLadleContext();

  useEffect(() => {
    dispatch({
      type: ActionType.UpdateTheme,
      value: ThemeState.Dark,
    });
  }, []);

  return (
    <RecoilRoot>
      <WithTheme>{children}</WithTheme>
    </RecoilRoot>
  );
};

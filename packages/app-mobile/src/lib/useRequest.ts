import { useBackgroundClient } from "@coral-xyz/recoil";
import { useEffect, useState } from "react";

export const useRequest = (method: string, ...params: any) => {
  const background = useBackgroundClient();
  const [state, setState] = useState();
  useEffect(() => {
    background
      .request({
        method,
        params,
      })
      .then((result) => {
        setState(result);
      });
  }, []);
  return state;
};

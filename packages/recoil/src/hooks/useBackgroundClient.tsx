import { useRecoilValue } from "recoil";
import { ChannelAppUiClient } from "@coral-xyz/common";
import * as atoms from "../atoms";

export function useBackgroundClient(): ChannelAppUiClient {
  return useRecoilValue(atoms.backgroundClient)!;
}

export function useBackgroundResponseClient(): ChannelAppUiClient {
  return useRecoilValue(atoms.backgroundResponseClient)!;
}

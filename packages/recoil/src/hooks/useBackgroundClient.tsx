import { useRecoilValue } from "recoil";
import { ChannelAppUiClient, ChannelAppUiResponder } from "@coral-xyz/common";
import * as atoms from "../atoms";

export function useBackgroundClient(): ChannelAppUiClient {
  return useRecoilValue(atoms.backgroundClient)!;
}

export function useBackgroundResponder(): ChannelAppUiResponder {
  return useRecoilValue(atoms.backgroundResponder)!;
}

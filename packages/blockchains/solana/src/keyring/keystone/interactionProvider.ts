import type { UR } from "@coral-xyz/common";
import { BrowserRuntimeCommon } from "@coral-xyz/common";
import type { SolSignRequest } from "@keystonehq/bc-ur-registry-sol";
import {
  CryptoMultiAccounts,
  SolSignature,
} from "@keystonehq/bc-ur-registry-sol";
import type { InteractionProvider as KeystoneInteractionProvider } from "@keystonehq/sol-keyring";

export class InteractionProvider implements KeystoneInteractionProvider {
  private static instance;

  constructor() {
    if (InteractionProvider.instance) {
      return InteractionProvider.instance;
    }
    InteractionProvider.instance = this;
  }

  private async onPlayCall(ur: UR): Promise<void> {
    BrowserRuntimeCommon.sendMessageToAppUi({
      type: "KEYSTONE_PLAY_UR",
      data: {
        ur,
      },
    });
  }

  public onPlay(fn: (ur: UR) => Promise<void>) {
    this.onPlayCall = fn;
  }

  private onReadCall(): Promise<UR> {
    return new Promise((resolve) => {
      const handler = (e) => {
        if (e.type === "KEYSTONE_SCAN_UR") {
          resolve(e.data.ur);
          BrowserRuntimeCommon.removeEventListener(handler);
        }
      };
      BrowserRuntimeCommon.addEventListenerFromAppUi(handler);
    });
  }

  public onRead(fn: () => Promise<UR>) {
    this.onReadCall = fn;
  }

  public async requestSignature(signRequest: SolSignRequest) {
    const ur = signRequest.toUR();
    await this.onPlayCall({
      type: ur.type,
      cbor: ur.cbor.toString("hex"),
    });
    const result = await this.onReadCall();
    return SolSignature.fromCBOR(Buffer.from(result.cbor, "hex"));
  }

  public async readCryptoMultiAccounts() {
    const result = await this.onReadCall();
    return CryptoMultiAccounts.fromCBOR(Buffer.from(result.cbor, "hex"));
  }
}

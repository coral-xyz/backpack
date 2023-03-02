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
  private windowId: number | undefined;
  private onReadCallCustom: () => Promise<UR>;

  constructor() {
    if (InteractionProvider.instance) {
      return InteractionProvider.instance;
    }
    InteractionProvider.instance = this;
  }

  private async onPlayCall(ur: UR): Promise<void> {
    const data: { windowId?: number } = await new Promise((resolve) => {
      BrowserRuntimeCommon.sendMessageToAppUi(
        {
          type: "KEYSTONE_PLAY_UR",
          data: {
            ur,
          },
        },
        resolve
      );
    });
    this.windowId = data.windowId;
  }

  public onPlay(fn: (ur: UR) => Promise<void>) {
    this.onPlayCall = fn;
  }

  private onReadCallDefault(): Promise<UR> {
    return new Promise((resolve, reject) => {
      const handler = (e) => {
        if (e.type === "KEYSTONE_SCAN_UR") {
          BrowserRuntimeCommon.removeEventListener(handler);
          resolve(e.data.ur);
        }
      };
      if (this.windowId) {
        const removeHandler = (winId: number) => {
          if (winId === this.windowId) {
            chrome.windows.onRemoved.removeListener(removeHandler);
            BrowserRuntimeCommon.removeEventListener(handler);
            reject("KeystoneError: User reject the signing.");
          }
        };
        chrome.windows.onRemoved.addListener(removeHandler, {
          windowTypes: ["popup"],
        });
      }
      BrowserRuntimeCommon.addEventListenerFromAppUi(handler);
    });
  }

  private onReadCall(): Promise<UR> {
    return this.onReadCallCustom
      ? this.onReadCallCustom()
      : this.onReadCallDefault();
  }

  public onRead(fn: () => Promise<UR>) {
    this.onReadCallCustom = fn;
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
    const accounts = CryptoMultiAccounts.fromCBOR(
      Buffer.from(result.cbor, "hex")
    );
    accounts.getDevice = () => "Backpack Extension";
    return accounts;
  }
}

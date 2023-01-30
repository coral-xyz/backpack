import type {
  UR,
} from "@coral-xyz/common";
import type { SolSignRequest } from "@keystonehq/bc-ur-registry-sol";
import { CryptoMultiAccounts , SolSignature } from "@keystonehq/bc-ur-registry-sol";
import type { InteractionProvider as KeystoneInteractionProvider } from "@keystonehq/sol-keyring";

export class InteractionProvider implements KeystoneInteractionProvider {
  private static instance;

  constructor() {
    if (InteractionProvider.instance) {
      return InteractionProvider.instance;
    }
    InteractionProvider.instance = this;
  }

  private onPlayCall(ur: UR): Promise<void> {
    throw new Error('Play QR code function has not been registed.');
  }

  public onPlay(fn: (ur: UR) => Promise<void>) {
    this.onPlayCall = fn;
  }

  private onReadCall(): Promise<UR> {
    throw new Error('Read QR code function has not been registed.');
  }

  public onRead(fn: () => Promise<UR>) {
    this.onReadCall = fn;
  }

  public async requestSignature (signRequest: SolSignRequest) {
    const ur = signRequest.toUR();
    await this.onPlayCall({
      type: ur.type,
      cbor: ur.cbor.toString('hex'),
    });
    const result = await this.onReadCall();
    return SolSignature.fromCBOR(Buffer.from(result.cbor, 'hex'));
  }

  public async readCryptoMultiAccounts() {
    const result = await this.onReadCall();
    return CryptoMultiAccounts.fromCBOR(Buffer.from(result.cbor, 'hex'));
  }
}

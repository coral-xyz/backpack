import { Message, MessageV0 } from "@solana/web3.js";
import { decode } from "bs58";
export class MessageV2 {
  static from(serializedMessage: string): Message | MessageV0 {
    try {
      const message = MessageV0.deserialize(decode(serializedMessage));
      return message;
    } catch (e) {
      return Message.from(Buffer.from(decode(serializedMessage)));
    }
  }
}

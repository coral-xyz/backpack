import { AddressLookupTableAccount, PublicKey } from "@solana/web3.js";

export type SerializedAddressLookupTableAccount = {
  key: string;
  state: {
    deactivationSlot: string;
    lastExtendedSlot: number;
    lastExtendedSlotStartIndex: number;
    authority?: string;
    addresses: Array<string>;
  };
} | null;

/*
 * Helper functions to serialize and deserialize RPC messages
 * so we can send them through the browser post message API
 * and parse them out the other side.
 */

export const addressLookupTableAccountParser = {
  serialize: (
    addressLookupTableAccount: AddressLookupTableAccount | null
  ): SerializedAddressLookupTableAccount => {
    if (!addressLookupTableAccount) {
      return null;
    }
    const serializedAddressLookupTableAccount = {
      key: addressLookupTableAccount.key.toString(),
      state: {
        deactivationSlot:
          addressLookupTableAccount.state.deactivationSlot.toString(),
        lastExtendedSlot: addressLookupTableAccount.state.lastExtendedSlot,
        lastExtendedSlotStartIndex:
          addressLookupTableAccount.state.lastExtendedSlotStartIndex,
        authority: addressLookupTableAccount.state.authority?.toString(),
        addresses: addressLookupTableAccount.state.addresses.map((address) =>
          address.toString()
        ),
      },
    };
    return serializedAddressLookupTableAccount;
  },
  deserialize: (
    serializedAddressLookupTableAccount: SerializedAddressLookupTableAccount
  ): AddressLookupTableAccount | null => {
    if (!serializedAddressLookupTableAccount) {
      return null;
    }
    const addressLookupTableAccount = new AddressLookupTableAccount({
      key: new PublicKey(serializedAddressLookupTableAccount.key),
      state: {
        deactivationSlot: BigInt(
          serializedAddressLookupTableAccount.state.deactivationSlot
        ),
        lastExtendedSlot:
          serializedAddressLookupTableAccount.state.lastExtendedSlot,
        lastExtendedSlotStartIndex:
          serializedAddressLookupTableAccount.state.lastExtendedSlotStartIndex,
        authority: serializedAddressLookupTableAccount.state.authority
          ? new PublicKey(serializedAddressLookupTableAccount.state.authority)
          : undefined,
        addresses: serializedAddressLookupTableAccount.state.addresses.map(
          (address) => new PublicKey(address)
        ),
      },
    });
    return addressLookupTableAccount;
  },
};

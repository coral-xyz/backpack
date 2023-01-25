import type { Connection } from "@solana/web3.js";

import { useEffect, useState } from "react";

import {
  getHashedName,
  getNameAccountKey,
  NameRegistryState,
} from "@bonfida/spl-name-service";
import { Blockchain } from "@coral-xyz/common";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { ethers } from "ethers";

// TODO(peter) share between extension/mobile
export function useIsValidAddress(
  blockchain: Blockchain,
  address: string,
  solanaConnection?: Connection,
  ethereumProvider?: ethers.providers.Provider
) {
  const [addressError, setAddressError] = useState<boolean>(false);
  const [isFreshAccount, setIsFreshAccount] = useState<boolean>(false); // Not used for now.
  const [accountValidated, setAccountValidated] = useState<boolean>(false);
  const [normalizedAddress, setNormalizedAddress] = useState<string>(address);

  // This effect validates the account address given.
  useEffect(() => {
    if (accountValidated) {
      setAccountValidated(false);
    }
    if (address === "") {
      setAccountValidated(false);
      setAddressError(false);
      return;
    }
    (async () => {
      if (blockchain === Blockchain.SOLANA) {
        let pubkey;

        if (!solanaConnection) {
          return;
        }

        // SNS Domain
        if (address.includes(".sol")) {
          try {
            const hashedName = await getHashedName(address.replace(".sol", ""));
            const nameAccountKey = await getNameAccountKey(
              hashedName,
              undefined,
              new PublicKey("58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx") // SOL TLD Authority
            );

            const owner = await NameRegistryState.retrieve(
              solanaConnection,
              nameAccountKey
            );

            pubkey = owner.registry.owner;
          } catch (e) {
            console.log("useIsValid error", e);
            setAddressError(true);
            return;
          }
        }

        if (!pubkey) {
          // Solana address validation
          try {
            pubkey = new PublicKey(address);
          } catch (err) {
            console.log("useIsValid error", err);
            setAddressError(true);
            // Not valid address so don't bother validating it.
            return;
          }
        }

        const account = await solanaConnection?.getAccountInfo(pubkey);
        console.log("useIsValid:account", account);

        // Null data means the account has no lamports. This is valid.
        if (!account) {
          setIsFreshAccount(true);
          setAccountValidated(true);
          setNormalizedAddress(pubkey.toString());
          return;
        }

        console.log(
          "useIsValid account.owner",
          account.owner,
          SystemProgram.programId
        );

        // Only allow system program accounts to be given. ATAs only!
        // TODO display an error to the user letting them know this type of address won't accept SOL, etc
        if (!account.owner.equals(SystemProgram.programId)) {
          console.log("useIsValid: account owner error");
          setAddressError(true);
          return;
        }

        console.log("useIsValid valid");

        // The account data has been successfully validated.
        setAddressError(false);
        setAccountValidated(true);
        setNormalizedAddress(pubkey.toString());
      } else if (blockchain === Blockchain.ETHEREUM) {
        // Ethereum address validation
        let checksumAddress;

        if (!ethereumProvider) {
          return;
        }

        if (address.includes(".eth")) {
          try {
            checksumAddress = await ethereumProvider?.resolveName(address);
          } catch (e) {
            setAddressError(true);
            return;
          }
        }

        if (!checksumAddress) {
          try {
            checksumAddress = ethers.utils.getAddress(address);
          } catch (e) {
            setAddressError(true);
            return;
          }
        }

        setAddressError(false);
        setAccountValidated(true);
        setNormalizedAddress(checksumAddress);
      }
    })();
  }, [address]);

  return {
    isValidAddress: accountValidated,
    isFreshAddress: isFreshAccount,
    isErrorAddress: addressError,
    normalizedAddress,
  };
}

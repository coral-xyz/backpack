import { useState } from "react";
import {
  getHashedName,
  getNameAccountKey,
  NameRegistryState,
} from "@bonfida/spl-name-service";
import { Blockchain } from "@coral-xyz/common";
import type { Connection } from "@solana/web3.js";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { ethers } from "ethers";
import { useAsyncEffect } from "use-async-effect";

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
  useAsyncEffect(
    // eslint-disable-next-line react-hooks/exhaustive-deps
    async (isRelevant) => {
      if (accountValidated) {
        setAccountValidated(false);
      }
      if (address === "") {
        setAccountValidated(false);
        setAddressError(false);
        return;
      }
      if (blockchain === Blockchain.SOLANA) {
        let pubkey;

        if (!solanaConnection) {
          return;
        }

        // SNS Domain
        if (address.endsWith(".sol")) {
          try {
            const hashedName = await getHashedName(address.replace(".sol", ""));
            if (!isRelevant()) {
              return;
            }
            const nameAccountKey = await getNameAccountKey(
              hashedName,
              undefined,
              new PublicKey("58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx") // SOL TLD Authority
            );
            if (!isRelevant()) {
              return;
            }
            const owner = await NameRegistryState.retrieve(
              solanaConnection,
              nameAccountKey
            );
            if (!isRelevant()) {
              return;
            }
            pubkey = owner.registry.owner;
          } catch (e) {
            setAddressError(true);
            return;
          }
        }

        // If it's not .SOL throw an error
        if (
          !pubkey &&
          address.split(".").length === 2 &&
          !address.endsWith(".sol")
        ) {
          setAddressError(true);
          return;
        }

        if (!pubkey) {
          // Solana address validation
          try {
            pubkey = new PublicKey(address);
          } catch (err) {
            setAddressError(true);
            // Not valid address so don't bother validating it.
            return;
          }
        }

        const account = await solanaConnection?.getAccountInfo(pubkey);
        if (!isRelevant()) {
          return;
        }
        // Null data means the account has no lamports. This is valid.
        if (!account) {
          setIsFreshAccount(true);
          setAccountValidated(true);
          setNormalizedAddress(pubkey.toString());
          return;
        }

        // Only allow system program accounts to be given. ATAs only!
        if (!account.owner.equals(SystemProgram.programId)) {
          setAddressError(true);
          return;
        }

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
            if (!isRelevant()) {
              return;
            }
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
    },
    [address]
  );

  return {
    isValidAddress: accountValidated,
    isFreshAddress: isFreshAccount,
    isErrorAddress: addressError,
    normalizedAddress: normalizedAddress,
  };
}

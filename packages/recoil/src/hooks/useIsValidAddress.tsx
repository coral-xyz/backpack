import { useState } from "react";
import { resolve } from "@bonfida/spl-name-service";
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
  const [normalizedAddress, setNormalizedAddress] = useState<string>(address);
  const [addressError, setAddressError] = useState<boolean | null>(null);
  const [isFreshAccount, setIsFreshAccount] = useState<boolean | null>(null); // Not used for now.
  const [accountValidated, setAccountValidated] = useState<boolean | null>(
    null
  );

  useAsyncEffect(
    async (isMounted) => {
      if (accountValidated) {
        setAccountValidated(false);
      }

      if (!isMounted()) {
        return;
      }

      const validationResults = await validateAddress(
        blockchain,
        address,
        solanaConnection,
        ethereumProvider
      );

      setAccountValidated(validationResults.isValidAddress);
      setIsFreshAccount(validationResults.isFreshAddress);
      setAddressError(validationResults.isErrorAddress);
      setNormalizedAddress(validationResults.normalizedAddress);
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

type ValidateAddressResults = {
  isValidAddress: boolean;
  isFreshAddress: boolean;
  isErrorAddress: boolean;
  normalizedAddress: string;
};

export async function validateAddress(
  blockchain: Blockchain,
  address: string,
  solanaConnection?: Connection,
  ethereumProvider?: ethers.providers.Provider
): Promise<ValidateAddressResults> {
  if (address === "") {
    return {
      isValidAddress: false,
      isFreshAddress: false,
      isErrorAddress: false,
      normalizedAddress: "",
    };
  }

  if (blockchain === Blockchain.SOLANA) {
    let pubkey;

    if (!solanaConnection) {
      throw new Error("Solana connection is required for address validation.");
    }

    // SNS Domain
    if (address.endsWith(".sol")) {
      try {
        pubkey = await resolve(solanaConnection, address);
      } catch (e) {
        return {
          isValidAddress: false,
          isFreshAddress: false,
          isErrorAddress: true,
          normalizedAddress: "",
        };
      }
    }

    // If it's not .SOL throw an error
    if (
      !pubkey &&
      address.split(".").length === 2 &&
      !address.endsWith(".sol")
    ) {
      return {
        isValidAddress: false,
        isFreshAddress: false,
        isErrorAddress: true,
        normalizedAddress: "",
      };
    }

    if (!pubkey) {
      // Solana address validation
      try {
        pubkey = new PublicKey(address);
      } catch (err) {
        return {
          isValidAddress: false,
          isFreshAddress: false,
          isErrorAddress: true,
          normalizedAddress: "",
        };
      }
    }

    const account = await solanaConnection.getAccountInfo(pubkey);

    // Null data means the account has no lamports. This is valid.
    if (!account) {
      return {
        isValidAddress: true,
        isFreshAddress: true,
        isErrorAddress: false,
        normalizedAddress: pubkey.toString(),
      };
    }

    // Only allow system program accounts to be given. ATAs only!
    if (!account.owner.equals(SystemProgram.programId)) {
      return {
        isValidAddress: false,
        isFreshAddress: false,
        isErrorAddress: true,
        normalizedAddress: "",
      };
    }

    // The account data has been successfully validated.
    return {
      isValidAddress: true,
      isFreshAddress: false,
      isErrorAddress: false,
      normalizedAddress: pubkey.toString(),
    };
  } else if (blockchain === Blockchain.ETHEREUM) {
    // Ethereum address validation
    let checksumAddress;

    if (!ethereumProvider) {
      throw new Error("Ethereum provider is required for address validation.");
    }

    if (address.includes(".eth")) {
      try {
        checksumAddress = await ethereumProvider.resolveName(address);
      } catch (e) {
        return {
          isValidAddress: false,
          isFreshAddress: false,
          isErrorAddress: true,
          normalizedAddress: "",
        };
      }
    }

    if (!checksumAddress) {
      try {
        checksumAddress = ethers.utils.getAddress(address);
      } catch (e) {
        return {
          isValidAddress: false,
          isFreshAddress: false,
          isErrorAddress: true,
          normalizedAddress: "",
        };
      }
    }

    return {
      isValidAddress: true,
      isFreshAddress: false,
      isErrorAddress: false,
      normalizedAddress: checksumAddress,
    };
  }

  return {
    isValidAddress: false,
    isFreshAddress: false,
    isErrorAddress: true,
    normalizedAddress: "",
  };
}

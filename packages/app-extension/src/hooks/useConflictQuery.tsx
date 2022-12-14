import type { Blockchain } from "@coral-xyz/common";
import { BACKEND_API_URL } from "@coral-xyz/common";

export const useConflictQuery = () => {
  const checkConflicts = async (
    blockchainPublicKeys: Array<{ blockchain: Blockchain; publicKey: string }>
  ) => {
    const response = await fetch(`${BACKEND_API_URL}/publicKeys`, {
      method: "POST",
      body: JSON.stringify(blockchainPublicKeys),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await response.json();
  };

  return checkConflicts;
};

import React, { useEffect } from "react";
import { usePublicKey, useConnection } from "react-xnft";
import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, AccountLayout } from "@solana/spl-token";
import { TokenAccountInfo } from "../types";

const getTokenAccounts = async (
  connection: Connection,
  publicKey: PublicKey,
  callback: (tokenAccounts: TokenAccountInfo[]) => void
) => {
  const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, {
    programId: new PublicKey(TOKEN_PROGRAM_ID),
  });

  callback(
    tokenAccounts.value
      .map((e) => {
        const accountInfo = AccountLayout.decode(e.account.data);
        var length = accountInfo.amount.length;

        let buffer = Buffer.from(accountInfo.amount);
        var amount = buffer.readUIntBE(0, length);

        if (amount > 0) {
          return {
            mint: new PublicKey(accountInfo.mint),
            tokenAccount: accountInfo,
            pubkey: e.pubkey,
          };
        } else {
          return null;
        }
      })
      .filter((e) => e != null) as TokenAccountInfo[]
  );
};

export default () => {
  const publicKey = usePublicKey();
  const connection = useConnection();
  const [tokenInfo, setTokenInfo] = React.useState<TokenAccountInfo[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  useEffect(() => {
    if (publicKey) {
      setLoading(true);
      getTokenAccounts(connection, publicKey, (tokenAccounts) => {
        setTokenInfo(tokenAccounts);
        setLoading(false);
      });
    } else {
      setTokenInfo([]);
      setLoading(false);
    }
  }, [connection, publicKey]);
  return { loading, tokens: tokenInfo };
};

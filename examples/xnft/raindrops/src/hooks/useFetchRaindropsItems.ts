import { PublicKey } from "@solana/web3.js";
import React, { useEffect } from "react";
import { TokenAccountInfo } from "../types";
import {
  getRaindropsItem,
  RaindropsItemClass,
  RaindropsItem,
} from "../utils/raindrops";
import { TOKEN_PROGRAM_ID, AccountLayout } from "@solana/spl-token";
import { Items } from "../mock-data/items";

const fetchRaindropItems = async (
  tokens: TokenAccountInfo[],
  callback: (raindropsItem: RaindropsItem[]) => void
) => {
  // const raindropsItems = await Promise.all(
  //   tokens.map(async (token) => ({
  //     item: await getRaindropsItem(token.mint),
  //     token,
  //   }))
  // );
  // callback(
  //   raindropsItems.filter(
  //     (fetchedItem) => !!fetchedItem.item
  //   ) as RaindropsItem[]
  // );

  const items = await Promise.all(
    Items.map(async (item) => {
      // const item = await getRaindropsItem(new PublicKey("zEpDPXKCBX2KaX82s7FxwWCgfQeX5Ejv82xMr5ag2nx"));
      const tokenAccounts =
        await window.xnft.connection.getTokenAccountsByOwner(
          new PublicKey("DUzYHuaLAHNKSR27FvuFYCH1oJwPKHmKwcjPnyHJ3eKA"),
          {
            programId: new PublicKey(TOKEN_PROGRAM_ID),
          }
        );
      console.log("token", tokenAccounts.value[0]);
      const tokenAccountLayout = AccountLayout.decode(
        tokenAccounts.value[0].account.data
      );
      if (!item) throw new Error("Mock item is fuked");
      return {
        item,
        token: {
          mint: new PublicKey(tokenAccountLayout.mint),
          tokenAccount: tokenAccountLayout,
          pubkey: tokenAccounts.value[0].account.pubkey,
        },
      };
    })
  );
  callback(items);
};

export default (tokens: TokenAccountInfo[] | null) => {
  const [raindropsItems, setRaindropsItems] = React.useState<RaindropsItem[]>(
    []
  );
  const [loading, setLoading] = React.useState<boolean>(false);
  useEffect(() => {
    if (tokens) {
      setLoading(true);
      fetchRaindropItems(tokens, (raindropsItems) => {
        setLoading(false);
        setRaindropsItems(raindropsItems);
      });
    } else {
      setLoading(false);
      setRaindropsItems([]);
    }
  }, [tokens]);
  return { loading, raindropsItems };
};

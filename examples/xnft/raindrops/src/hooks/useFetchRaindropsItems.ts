import React, { useEffect } from "react";
import { TokenAccountInfo } from "../types";
import {
  getRaindropsItem,
  RaindropsItemClass,
  RaindropsItem,
} from "../utils/raindrops";

const fetchRaindropItems = async (
  tokens: TokenAccountInfo[],
  callback: (raindropsItem: RaindropsItem[]) => void
) => {
  const raindropsItems = await Promise.all(
    tokens.map(async (token) => ({
      item: await getRaindropsItem(token.mint),
      token,
    }))
  );
  callback(
    raindropsItems.filter(
      (fetchedItem) => !!fetchedItem.item
    ) as RaindropsItem[]
  );
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

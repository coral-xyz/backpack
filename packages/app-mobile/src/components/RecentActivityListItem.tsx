import { formatWalletAddress } from "@coral-xyz/common";

import {
  ListItemActivity,
  ListItemSentReceived,
  ListItemTokenSwap,
} from "~components/ListItem";
import { parseTransactionDescription } from "~lib/RecentActivityUtils";
export type ListItemProps = any;

export function ListItem({
  item,
  getTokenUrl,
}: {
  item: ListItemProps;
  getTokenUrl: any;
}): JSX.Element {
  switch (item.type) {
    case "SWAP": {
      const { sent, received, display, receivedToken, sentToken } =
        parseTransactionDescription(item);
      const sentTokenUrl = getTokenUrl(sentToken);
      const receivedTokenUrl = getTokenUrl(receivedToken);
      return (
        <ListItemTokenSwap
          grouped
          title="Token Swap"
          caption={display}
          sent={sent}
          received={received}
          sentTokenUrl={sentTokenUrl.logo}
          receivedTokenUrl={receivedTokenUrl.logo}
        />
      );
    }
    case "TRANSFER": {
      const { to, amount, action, token } = parseTransactionDescription(item);
      const tokenUrl = getTokenUrl(token);
      return (
        <ListItemSentReceived
          grouped
          address={to}
          action={action}
          amount={amount}
          iconUrl={tokenUrl?.logo}
        />
      );
    }
    case "NFT_LISTING": {
      const { nft, amount, marketplace } = parseTransactionDescription(item);
      return (
        <ListItemActivity
          grouped
          onPress={console.log}
          topLeftText={nft}
          bottomLeftText={`Listed on ${marketplace}`}
          bottomRightText={amount} // TODO amount in USD
          topRightText={amount}
          // nft image sold
          iconUrl="https://swr.xnfts.dev/1min/https://madlist-images.s3.us-west-2.amazonaws.com/backpack_dev.png"
        />
      );
    }
    case "NFT_SALE": {
      const { nft, amount, marketplace } = parseTransactionDescription(item);
      return (
        <ListItemActivity
          grouped
          onPress={console.log}
          topLeftText={nft}
          bottomLeftText={`Sold on ${marketplace}`}
          bottomRightText={amount} // TODO amount in USD
          topRightText={amount}
          // nft image sold
          iconUrl="https://swr.xnfts.dev/1min/https://madlist-images.s3.us-west-2.amazonaws.com/backpack_dev.png"
        />
      );
    }
    case "UNKNOWN":
    default: {
      return (
        <ListItemActivity
          grouped
          onPress={console.log}
          topLeftText="App Interaction"
          bottomLeftText={formatWalletAddress(item.hash)}
          bottomRightText=""
          topRightText=""
          showSuccessIcon={!item.transactionError}
          showErrorIcon={item.transactionError}
        />
      );
    }
  }
}

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
  onPress,
}: {
  item: ListItemProps;
  getTokenUrl: any;
  onPress: any;
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
          onPress={onPress}
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
          onPress={onPress}
          address={to}
          action={action}
          amount={amount}
          iconUrl={tokenUrl?.logo}
          showSuccessIcon={!tokenUrl?.logo}
        />
      );
    }
    case "NFT_LISTING": {
      const { nft, amount, marketplace } = parseTransactionDescription(item);
      return (
        <ListItemActivity
          grouped
          onPress={onPress}
          topLeftText={nft}
          bottomLeftText={`Listed on ${marketplace}`}
          bottomRightText={amount} // TODO amount in USD
          topRightText={amount}
          showSuccessIcon={!item.transactionError}
          showErrorIcon={item.transactionError}
        />
      );
    }
    case "NFT_SALE": {
      const { nft, amount, marketplace } = parseTransactionDescription(item);
      return (
        <ListItemActivity
          grouped
          onPress={onPress}
          topLeftText={nft}
          bottomLeftText={`Sold on ${marketplace}`}
          bottomRightText={amount} // TODO amount in USD
          topRightText={amount}
          showSuccessIcon={!item.transactionError}
          showErrorIcon={item.transactionError}
        />
      );
    }
    case "UNKNOWN":
    default: {
      return (
        <ListItemActivity
          grouped
          onPress={onPress}
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

import { formatWalletAddress } from "@coral-xyz/common";
// TODO
type GraphQLTransaction = any;

type Item = {
  timestamp: string;
  id: string;
};

type Section = {
  title: string;
  data: Item[];
};

export function convertTransactionDataToSectionList(
  transactions: GraphQLTransaction[]
): Section[] {
  // Group transactions by timestamp
  const groups = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.node.timestamp).toLocaleDateString();
    if (acc[date]) {
      acc[date].push(transaction.node);
    } else {
      acc[date] = [transaction.node];
    }
    return acc;
  }, {});

  const sections = Object.keys(groups).map((date) => {
    return {
      title: date,
      data: groups[date],
    };
  });

  return sections;
}

export function removeLastPeriod(str: string) {
  if (str.endsWith(".")) {
    return str.slice(0, -1);
  }

  return str;
}

function parseTokenName(name: string) {
  if (name.length < 6) {
    return name;
  }

  return formatWalletAddress(name);
}

export function parseSwap(str: string) {
  // "EcxjN4mea6Ah9WSqZhLtSJJCZcxY73Vaz6UVHFZZ5Ttz swapped 0.001 SOL for 0.022 USDC"
  try {
    const [sent, received] = str.split("swapped ")[1].split(" for ");
    const sentToken = parseTokenName(sent.split(" ")[1]);
    const receivedToken = parseTokenName(received.split(" ")[1]);
    return {
      sent: `-${sent}`,
      received: `+${received}`,
      display: `${sentToken} -> ${receivedToken}`,
    };
  } catch (_err) {
    return {
      sent: "",
      received: "",
      display: "",
    };
  }
}

export function parseTransfer(str: string) {
  // "EcxjN4mea6Ah9WSqZhLtSJJCZcxY73Vaz6UVHFZZ5Ttz transferred 0.1 SOL to 47iecF4gWQYrGMLh9gM3iuQFgb1581gThgfRw69S55T8."
  try {
    const _to = str.split("to ");
    const to = _to[1]; // remove period at the end
    const amount = _to[0].split("transferred ")[1].trim();
    const action = "Sent"; // TODO sent/received, pass down publickey
    return { to: formatWalletAddress(to), amount, action };
  } catch (_err) {
    return { to: "", amount: "", action: "Sent" };
  }
}

export function parseNftListing(str: string) {
  // '5iM4vFHv7vdiZJYm7rQwHGgvpp9zHEwZHGNbNATFF5To listed Mad Lad #8811 for 131 SOL on MAGIC_EDEN.'
  try {
    const [_address, _rest] = str.split(" listed ");
    const [nft, _amounts] = _rest.split(" for ");
    const [amount, marketplace] = _amounts.split(" on ");
    return {
      nft,
      amount,
      marketplace,
    };
  } catch (_err) {
    return {
      nft: "",
      amount: "",
      marketplace: "",
    };
  }
}

export function parseNftSold(str: string) {
  // '5iM4vFHv7vdiZJYm7rQwHGgvpp9zHEwZHGNbNATFF5To sold Mad Lad #3150 to 69X4Un6qqC8QBeBKk6zrqUVKGccnWqgUkwdLcC7wiLFB for 131 SOL on MAGIC_EDEN.'
  try {
    const [nft, _rest] = str.split(" sold ")[1].split(" to ");
    const [amount, marketplace] = _rest
      .split(" for ")[1]
      .split(" for ")[1]
      .split(" on ");
    return { nft, amount, marketplace };
  } catch (_err) {
    return { nft: "", amount: "", marketplace: "" };
  }
}

export function parseTransactionDescription(transaction) {
  const f = removeLastPeriod(transaction.description);
  switch (transaction.type) {
    case "SWAP": {
      return parseSwap(f);
    }
    case "TRANSFER": {
      return parseTransfer(f);
    }
    case "NFT_LISTING": {
      return parseNftListing(f);
    }
    case "NFT_SALE": {
      return parseNftSold(f);
    }
    default:
      return transaction.description;
  }
}

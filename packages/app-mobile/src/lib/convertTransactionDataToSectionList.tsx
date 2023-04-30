// TODO
type GraphQLTransaction = any;

type Item = {
  timestamp: string;
  id: string;
}

type Section = {
  title: string;
  data: Item[];
};

export function convertTransactionDataToSectionList(
  transactions: GraphQLTransaction[]
): Section[] {
  // Group transactions by timestamp
  const groups = transactions.reduce((acc, transaction) => {
    const timestamp = transaction.node.timestamp;
    if (acc[timestamp]) {
      acc[timestamp].push(transaction.node);
    } else {
      acc[timestamp] = [transaction.node];
    }
    return acc;
  }, {});

  // Convert groups to an array of sections with timestamp as title
  const sections = Object.keys(groups).map((timestamp) => {
    return {
      title: timestamp,
      data: groups[timestamp],
    };
  });

  return sections;
}

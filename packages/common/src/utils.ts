export function toTitleCase(blockchain: string) {
  return (
    blockchain.slice(0, 1).toUpperCase() + blockchain.toLowerCase().slice(1)
  );
}

export function toTitleCase(blockchain: string) {
  return (
    blockchain.slice(0, 1).toUpperCase() + blockchain.toLowerCase().slice(1)
  );
}

/**
 * Formats a number or number string into a pretty USD string
 * @example
 * formatUSD(-1234567.89) // "-$1,234,567.89"
 */
export function formatUSD(amount: number | string) {
  const amountNumber = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(String(amountNumber)));
}

const formatterCompact = Intl.NumberFormat("en", {
  notation: "compact",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const formatter = Intl.NumberFormat("en", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatPrice(price: number | null, compact: boolean = false): string {
  const priceFloat = price ? price + 0 : 0;

  return compact
    ? formatterCompact.format(priceFloat)
    : formatter.format(priceFloat);
}

export default formatPrice;

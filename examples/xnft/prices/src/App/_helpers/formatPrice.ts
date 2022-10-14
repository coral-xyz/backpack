const formatter = Intl.NumberFormat("en", { notation: "compact" });

function formatPrice(price: number | null, compact: boolean = false): string {
  const priceFloat = price ? price + 0 : 0;

  const formattedPrice =
    priceFloat >= 1
      ? (Math.round(priceFloat * 100) / 100).toFixed(2)
      : (Math.round(priceFloat * 100000) / 100000).toFixed(5);

  if (compact) {
    return formatter.format(parseFloat(formattedPrice));
  }
  return formattedPrice;
}

export default formatPrice;

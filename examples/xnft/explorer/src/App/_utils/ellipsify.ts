const ellipsisify = (
  str: string,
  cutoff: number,
  remain: number,
  ellipsis = "..."
) => {
  const inputType = typeof str;
  if (inputType !== "string") {
    return "";
  }

  if (str.length <= cutoff) return str;
  if (!cutoff || cutoff + remain >= str.length) return str;
  if (!remain) return `${str.substring(0, cutoff)}${ellipsis}`;

  return `${str.substring(0, cutoff)}${ellipsis}${str.substring(
    str.length - remain
  )}`;
};

export default ellipsisify;

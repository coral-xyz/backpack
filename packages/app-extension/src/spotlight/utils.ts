export const getCurrentCounter = (
  arrowIndex: number,
  allResultsLength: number
) => {
  return arrowIndex >= 0
    ? arrowIndex % allResultsLength
    : (arrowIndex +
        -1 * Math.ceil(arrowIndex / allResultsLength) * allResultsLength) %
        allResultsLength;
};

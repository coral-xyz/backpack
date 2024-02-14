export function displayOriginTitle(title: string) {
  // Truncate title if above length
  const titleTruncateLength = 20;

  let truncatedTitle;
  if (title && title.length > titleTruncateLength) {
    truncatedTitle = title.substring(0, titleTruncateLength).trim() + "...";
  } else if (title) {
    truncatedTitle = title;
  } else {
    // Default title if no title is provided
    truncatedTitle = "Website";
  }

  return truncatedTitle;
}

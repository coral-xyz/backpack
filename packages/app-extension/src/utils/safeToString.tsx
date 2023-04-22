const safeToString = (item: any): string => {
  try {
    return item.toString();
  } catch (error) {
    console.error("Error converting to string:", error);
    return "";
  }
};

export default safeToString;

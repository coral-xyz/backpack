export const getAuthHeader = (
  jwt?: string
): {
  Authorization?: string;
} => {
  if (jwt) {
    return {
      Authorization: `Bearer ${jwt}`,
    };
  }
  return {};
};

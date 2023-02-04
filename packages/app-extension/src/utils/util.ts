export const truncateName = (name: string, size: number) => {
  if (name.length > size) {
    return name.slice(0, size - 4) + "..." + name.slice(-1);
  }
  return name;
};

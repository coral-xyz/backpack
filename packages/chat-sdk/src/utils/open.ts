export const openWindow = (url: string, target: string) => {
  const newWindow = window.open(url, target);
  if (newWindow) {
    newWindow.opener = null;
  }
};

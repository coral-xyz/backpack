import { View } from "react-native";
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export function RandomBackgroundScreen() {
  return <View style={{ flex: 1, backgroundColor: getRandomColor() }} />;
}

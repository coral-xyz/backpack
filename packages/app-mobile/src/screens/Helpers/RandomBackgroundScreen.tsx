import { View } from "react-native";
function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export function RandomBackgroundScreen() {
  return <View style={{ flex: 1, backgroundColor: getRandomColor() }} />;
}

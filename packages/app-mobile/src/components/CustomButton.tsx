import { Pressable, Text } from "react-native";
import tw from "twrnc";

import { addTestIdentifier } from "../lib/addTestIdentifier";

export const CustomButton: React.FC<{
  text: string;
  primary?: boolean;
  onPress?: (event: Event) => void;
}> = ({ text, primary, onPress = console.log }) => (
  <Pressable
    style={tw`${
      primary ? "bg-teal-500" : "bg-gray-800"
    } p-4 rounded-xl mt-2 mb-2`}
    onPress={onPress}
    {...addTestIdentifier(text)}
  >
    <Text style={tw`text-white text-center font-medium ios:text-xl`}>
      {text}
    </Text>
  </Pressable>
);

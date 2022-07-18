import { Text } from "react-native";
import tw from "twrnc";

export const ErrorMessage = (props: any) =>
  props.for ? <Text style={tw`text-red-400`}>{props.for.message}</Text> : null;

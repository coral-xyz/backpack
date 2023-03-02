import { Text } from "react-native";

export const ErrorMessage = (props: any) =>
  props.for ? <Text style={{ color: "red" }}>{props.for.message}</Text> : null;

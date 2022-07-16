import { View } from "react-native";
import tw from "twrnc";

export const MainContent: React.FC<{ centered?: boolean }> = ({
  children,
  centered,
}) => (
  <View style={tw`flex-grow ${centered ? "content-center" : ""} p-4`}>
    {children}
  </View>
);

export const ButtonFooter: React.FC = ({ children }) => (
  <View style={tw`p-2`}>{children}</View>
);

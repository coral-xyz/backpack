import { Text, View } from "react-native";
import { Link } from "react-router-native";
import tw from "twrnc";

export default function NeedsOnboarding() {
  return (
    <>
      <View style={tw`flex-grow content-center p-4`}>
        <Text style={tw`text-white text-5xl font-bold text-center mb-5 mt-20`}>
          Backpack
        </Text>
        <Text style={tw`text-[#71717A] text-lg text-center`}>
          A home for your xNFTs
        </Text>
      </View>

      <View style={tw`flex flex-row p-2`}>
        <Button text="Create a new wallet" />
        <Button text="Import an existing wallet" />
      </View>
    </>
  );
}

const Button: React.FC<{ text: string }> = ({ text }) => (
  <Link
    to="/create-wallet"
    style={tw`bg-[#3F3F46] p-8 m-2 rounded-lg flex-1 justify-end`}
  >
    <Text style={tw`text-white`}>{text}</Text>
  </Link>
);

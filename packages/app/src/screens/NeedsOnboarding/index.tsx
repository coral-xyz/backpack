import { Pressable, Text, View } from "react-native";
import tw from "twrnc";

export default function NeedsOnboarding({ navigation }: any) {
  return (
    <>
      <View style={tw`flex-grow content-center p-4`}>
        <Text style={tw`text-white text-2xl`}>Backpack</Text>
        <Text style={tw`text-[#71717A] text-lg`}>A home for your xNFTs</Text>
      </View>
      <View style={tw`flex flex-row`}>
        <Pressable
          style={tw`bg-[#3F3F46] p-8 rounded-lg m-4`}
          onPress={() => navigation.navigate("CreateWallet")}
        >
          <Text style={tw`text-white`}>Create a new wallet</Text>
        </Pressable>
        <Pressable style={tw`bg-[#3F3F46] p-8 rounded-lg m-4`} disabled>
          <Text style={tw`text-white`}>Import an existing wallet</Text>
        </Pressable>
      </View>
    </>
  );
}

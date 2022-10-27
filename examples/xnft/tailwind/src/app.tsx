import React, { useState } from "react";
import {
  Text,
  View,
  useMetadata,
  Image,
  Custom,
  Svg,
  Path,
  Button,
  useConnection,
  TextField,
} from "react-xnft";

export function App() {
  return <Metadata />;
}

function Metadata() {
  const [inputText, setInputText] = useState("");
  const metadata = useMetadata();
  const connection = useConnection();
  console.log("conn is " + connection);
  return (
    <View>
      <View tw="p-2">
        <Text tw="font-bold text-center">
          gm {metadata.username}, you are using{" "}
          {metadata.isDarkMode ? "Dark Mode" : "Light Mode"}
        </Text>
      </View>
      <Image
        tw="w-32 h-32 rounded-full mx-auto"
        src="https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?cs=srgb&dl=pexels-pixabay-45201.jpg&fm=jpg"
      />
      <View tw="p-2 grid grid-cols-3 gap-1 content-start">
        <Button>Button 1</Button>
        <Button tw="bg-blue-500 hover:bg-blue-700 text-white font-bold ">
          Button 2
        </Button>
        <Button tw="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
          Button 3
        </Button>
      </View>
      <View tw="flex justify-center">
        <Button tw="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">
          <Svg
            tw="fill-current w-4 h-4 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <Path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
          </Svg>
          <View>Download</View>
        </Button>
      </View>
      <View tw="p-4">
        <TextField
          value={inputText}
          placeholder={"placeholder"}
          onChange={(e) => setInputText(e.target.value)}
        />
      </View>
      <View tw="p-4">
        <TextField
          value={inputText}
          placeholder={"placeholder"}
          multiline={true}
          numberOfLines={4}
          onChange={(e) => setInputText(e.target.value)}
        />
      </View>
    </View>
  );
}

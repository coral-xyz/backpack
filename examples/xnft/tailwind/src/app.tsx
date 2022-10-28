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
      <View tw="p-4">
        <View tw="relative">
          <View tw="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
            <Svg
              aria-hidden="true"
              tw="w-5 h-5 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <Path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></Path>
            </Svg>
          </View>
          <TextField
            tw="block p-4 pl-4 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Amount"
          />
          <Button
            type="submit"
            tw="flex text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            <Image
              tw="w-8 pr-2"
              src={
                "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png"
              }
            />
            <View>ETH</View>
            <Svg
              tw="fill-current w-4 h-4 ml-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <Path d="M19 9l-7 7-7-7" />
            </Svg>
          </Button>
        </View>
      </View>
    </View>
  );
}

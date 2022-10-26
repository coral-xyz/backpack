import React from "react";
import {
  Text,
  View,
  useMetadata,
  Image,
  Custom,
  Button,
  useConnection,
} from "react-xnft";

export function App() {
  return <Metadata />;
}

function Metadata() {
  const metadata = useMetadata();
  const connection = useConnection();
  console.log("conn is " + connection);
  return (
    <View>
      <Space margin={50} />
      <View>
        <Text twClassName="font-bold text-center">
          gm {metadata.username}, you are using{" "}
          {metadata.isDarkMode ? "Dark Mode" : "Light Mode"}
        </Text>
      </View>
      <Image
        twClassName="w-32 h-32 rounded-full mx-auto"
        src="https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?cs=srgb&dl=pexels-pixabay-45201.jpg&fm=jpg"
      />
      <Button twClassName="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Button
      </Button>
      <Centralize>
        <Image src={metadata.avatarUrl} style={{ maxWidth: 100 }} />
      </Centralize>
      <Space margin={20} />
      <Centralize>
        <Text>
          gm {metadata.username}, you are using{" "}
          {metadata.isDarkMode ? "Dark Mode" : "Light Mode"}
        </Text>
      </Centralize>
    </View>
  );
}

export const Space = ({ margin }) => {
  return <Custom component={"div"} style={{ marginTop: margin }}></Custom>;
};

export const Centralize = ({ children }) => {
  return (
    <Custom
      component={"div"}
      style={{ display: "flex", justifyContent: "center" }}
    >
      {children}
    </Custom>
  );
};

import React from "react";
import { View, Text } from "react-xnft";
import { Video } from "./components/Video";
import { Audio } from "./components/Audio";

export function App() {
  return (
    <View>
      <Text>Video</Text>
      <Video
        src={"https://www.w3schools.com/html/mov_bbb.mp4"}
        autoplay={false}
        controls={true}
      />
      <Text>Audio</Text>
      <Audio
        autoplay={false}
        controls={true}
        src={"https://www.w3schools.com/html/horse.mp3"}
      />
    </View>
  );
}

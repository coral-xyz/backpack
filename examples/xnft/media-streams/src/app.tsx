import React, { useEffect, useState } from "react";
import { View, Text, Video, Audio } from "react-xnft";

export function App() {
  const [audioTrack, setAudioTrack] = useState(null);
  const [videoTrack, setVideoTrack] = useState(null);

  useEffect(() => {
    window.navigator.getUserMedia();
  }, []);

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

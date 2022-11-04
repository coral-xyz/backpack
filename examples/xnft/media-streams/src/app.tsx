import React, { useEffect, useState } from "react";
import { View, Text, Video, Audio } from "react-xnft";

export function App() {
  const [audioTrack, setAudioTrack] = useState<MediaStreamTrack | null>(null);
  const [videoTrack, setVideoTrack] = useState<MediaStreamTrack | null>(null);

  const init = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setAudioTrack(stream.getAudioTracks()[0]);
    setVideoTrack(stream.getVideoTracks()[0]);
  };
  useEffect(() => {
    init();
  }, []);

  return (
    <View>
      <Text>Audio</Text>
      {audioTrack && (
        <Audio
          autoplay={true}
          controls={true}
          volume={0.2}
          stream={new MediaStream([audioTrack])}
        />
      )}
      <Text>Video</Text>
      {videoTrack && (
        <View tw={"overflow-hidden relative m-3 rounded-3xl"}>
          <Video
            autoplay={true}
            volume={1}
            stream={new MediaStream([videoTrack])}
            tw={"relative"}
          />
        </View>
      )}
    </View>
  );
}

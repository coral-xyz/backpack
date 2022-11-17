import React from "react";
import { Loading, View } from "react-xnft";

function CenteredLoader() {
  return (
    <View
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <Loading />
    </View>
  );
}

export default CenteredLoader;

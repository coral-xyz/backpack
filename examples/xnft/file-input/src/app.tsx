import { useState } from "react";
import ReactXnft, { View, Text, FileInput } from "react-xnft";

export function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  return (
    <View style={{ color: "white" }}>
      <Text>Select Files:</Text>
      <FileInput
        onChange={(e) => setSelectedFiles(e.target.files || selectedFiles)}
      />

      <Text>Files you Selected:</Text>

      {selectedFiles.map((f) => (
        <Text>{f?.name ?? ""}</Text>
      ))}
    </View>
  );
}

import { useState } from "react";
import ReactXnft, { View, Text, FileInput } from "react-xnft";

export function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  return (
    <View style={{ color: "white" }}>
      <FileInput
        onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
        multiple={false}
      ></FileInput>
      <Text>Files you Selected:</Text>

      {selectedFiles.map((f) => (
        <Text>{`name: ${f?.name} size: ${f?.size} type: ${f?.type}`}</Text>
      ))}
    </View>
  );
}

import React from "react";
import { Text, TextField, View } from "react-xnft";
import { atom, selector, useRecoilState, useRecoilValue } from "recoil";

// adapted from https://recoiljs.org/docs/introduction/getting-started

const textState = atom({
  key: "textState",
  default: "",
});

const charCountState = selector({
  key: "charCountState",
  get: ({ get }) => {
    const text = get(textState);

    return text.length;
  },
});

const CharacterCount = () => {
  const count = useRecoilValue(charCountState);

  return <Text>Character Count: {count}</Text>;
};

const TextInput = () => {
  const [text, setText] = useRecoilState(textState);

  const onChange = (event) => {
    setText(event.target.value);
  };

  return (
    <View>
      <TextField
        value={text}
        onChange={onChange}
        placeholder="Enter text here..."
      />
      <Text>Echo: {text}</Text>
    </View>
  );
};

export const App = () => (
  <>
    <TextInput />
    <CharacterCount />
  </>
);

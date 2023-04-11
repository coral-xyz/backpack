---
sidebar_position: 1
title: Introduction
---

React xNFT is a framework for building executable NFTs. For a high level introduction see the introductory [blog post](https://www.coral.community/blog). Here we'll discuss how to design, build, and ship native wallet applications with [Backpack](https://www.backpack.app/) and the framework.
In many ways, React xNFT is just React. You have everything you're used to like JSX, hooks, functional components, and browser APIs. The major difference is that apps run inside an isolated browser sandbox without access to the DOM. Whenever you want to render something, you need to use the components provided by react-xnft, which will handle all communication with the host environment to safely render components, giving developers the ability to build decentralized UIs with a native look and feel.

Minimum Viable xNFT
In practice, this looks like the following,
```ts
import ReactXnft, { AnchorDom, View, Text } from "react-xnft";


ReactXnft.render(
  <AnchorDom>
    <App />
  </AnchorDom>
);


const App = () => {
  return (
    <View>
      <Text style={{ color: 'blue' }}>Hello, World!</Text>
    </View>
  );
};
```

Here we have the minimum viable xNFT program. Your classic ```Hello, World!``` as an xNFT. This can be built, minted, and run inside Backpack as a native program.
The documentation here will serve as a starting (though incomplete), reference for using the React xNFT framework. There will be glass, lots of glass. So it's encouraged you join the Discord and ask (and answer) some questions.
Now let's chew some glass.
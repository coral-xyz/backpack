import React from "react";
import ReactXnft, { AnchorDom } from "react-xnft";
import { App } from "./App/App";
import { RecoilRoot } from "recoil";

ReactXnft.render(
  <AnchorDom>
    <RecoilRoot>
      <App />
    </RecoilRoot>
  </AnchorDom>
);

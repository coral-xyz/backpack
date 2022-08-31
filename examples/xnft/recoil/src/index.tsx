import React from "react";
import ReactXnft, { AnchorDom } from "react-xnft";
import { RecoilRoot } from "recoil";
import { App } from "./app";

ReactXnft.render(
  <AnchorDom>
    <RecoilRoot>
      <App />
    </RecoilRoot>
  </AnchorDom>
);

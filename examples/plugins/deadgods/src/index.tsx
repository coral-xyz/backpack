import ReactXnft, { AnchorDom } from "react-xnft";
import { App } from "./app";
import { Widget } from "./widget";

ReactXnft.render(
  <AnchorDom>
    <App />
  </AnchorDom>
);

ReactXnft.renderWidget(
  <AnchorDom>
    <Widget />
  </AnchorDom>
);

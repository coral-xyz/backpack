import AnchorUi, { AnchorDom } from "@coral-xyz/anchor-ui";
import { App } from "./app";
import { Widget } from "./widget";

AnchorUi.render(
  <AnchorDom>
    <App />
  </AnchorDom>
);

AnchorUi.renderWidget(
  <AnchorDom>
    <Widget />
  </AnchorDom>
);

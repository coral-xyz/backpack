import { context } from "@200ms/anchor-ui";
import { Example } from "./plugin";

window.onload = () => {
  context().launchUi(new Example());
};

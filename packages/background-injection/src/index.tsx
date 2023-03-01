// This file is here bc of our HMR setup. if we placed this directly into the extension
// it would hot reload the background script, which causes the extension to break
// by keeping this here, it only reloads extension code
import { start } from "@coral-xyz/background";

start({
  isMobile: false,
});

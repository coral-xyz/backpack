import { getLogger } from "@200ms/common";
import { ProviderInjection } from "./provider";
import { ProviderUiInjection } from "./provider-ui";
import React from "react";
import * as Solana from "@solana/web3.js";
// import * as Anchor from "@project-serum/anchor";

const logger = getLogger("provider-injection");

// Script entry.
function main() {
  logger.debug("starting injected script");
  initProvider();
  logger.debug("provider ready");
}

function initProvider() {
  window.anchor = new ProviderInjection();
  window.anchorUi = new ProviderUiInjection();

  window.libs = {
    // Anchor,
    React,
    Solana,
  };
}

main();

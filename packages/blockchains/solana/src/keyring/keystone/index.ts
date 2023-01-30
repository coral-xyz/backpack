import { BaseKeyring } from "@keystonehq/sol-keyring";

import { InteractionProvider } from './interactionProvider';

export class KeystoneKeyring extends BaseKeyring {
  private interaction
  static type = BaseKeyring.type;

  static getEmptyKeyring(): KeystoneKeyring {
    return new KeystoneKeyring();
  }

  constructor() {
    super();
  }

  getInteraction = () => {
    if (!this.interaction) {
      this.interaction = new InteractionProvider();
    }
    return this.interaction;
  };
}

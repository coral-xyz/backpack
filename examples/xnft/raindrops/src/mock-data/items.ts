import { State } from "@raindrops-protocol/raindrops";
import { web3 } from "@project-serum/anchor";

const PUBLIC_KEYS = [
  new web3.PublicKey("JCzLLRSDGtrsuNBxtBefPJF7NsitNK1YLySJFjfyYJ6t"),
];

export const Items: State.Item.Item[] = [
  new State.Item.Item({
    namespaces: [
      {
        indexed: true,
        namespace: PUBLIC_KEYS[0],
        inherited: State.InheritanceState.NotInherited,
      },
    ],
    padding: 0,
    parent: PUBLIC_KEYS[0],
    classIndex: 0,
    mint: PUBLIC_KEYS[0],
    metadata: PUBLIC_KEYS[0],
    edition: PUBLIC_KEYS[0],
    bump: 255,
    tokensStaked: 0,
    data: {
      usageStateRoot: {
        root: PUBLIC_KEYS[0],
        inherited: State.InheritanceState.NotInherited,
      },
      usageStates: [
        {
          index: 0,
          uses: 10,
          activatedAt: Date.now(),
        },
      ],
    },
  }),
  new State.Item.Item({
    namespaces: [
      {
        indexed: true,
        namespace: PUBLIC_KEYS[0],
        inherited: State.InheritanceState.NotInherited,
      },
    ],
    padding: 0,
    parent: PUBLIC_KEYS[0],
    classIndex: 0,
    mint: PUBLIC_KEYS[0],
    metadata: PUBLIC_KEYS[0],
    edition: PUBLIC_KEYS[0],
    bump: 255,
    tokensStaked: 0,
    data: {
      usageStateRoot: {
        root: PUBLIC_KEYS[0],
        inherited: State.InheritanceState.NotInherited,
      },
      usageStates: [
        {
          index: 0,
          uses: 20,
          activatedAt: Date.now(),
        },
      ],
    },
  }),
];

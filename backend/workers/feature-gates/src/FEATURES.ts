import type { FEATURE_GATES_MAP } from "@coral-xyz/common";

export const FEATURE_GATES = ({
  dropzoneUsers,
  userId,
}: {
  dropzoneUsers: string[];
  userId?: string;
}) =>
  ({
    BARTER_ENABLED: false,
    DROPZONE_ENABLED: Boolean(userId && dropzoneUsers.includes(userId)),
    GQL_BALANCES: false,
    GQL_NOTIFICATIONS: true,
    GQL_TRANSACTION_HISTORY: false,
    MESSAGING_ENABLED: true,
    PRIMARY_PUBKEY_ENABLED: true,
    STICKER_ENABLED: true,
    STRIPE_ENABLED: true,
    SWAP_FEES_ENABLED: false,
  } satisfies {
    // ensure all keys are present
    [feature in keyof FEATURE_GATES_MAP]: boolean;
  });

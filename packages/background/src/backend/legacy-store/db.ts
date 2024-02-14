import { persistentDB } from "@coral-xyz/secure-background/legacyExport";
import type { SecureDB } from "@coral-xyz/secure-background/types";

export const LocalStorageDb = persistentDB as SecureDB<string>;
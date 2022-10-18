import { array, Infer } from "superstruct";
import { TokenInfoType } from "./TokenInfoType";

export type TokenListType = Infer<typeof TokenListType>;
export const TokenListType = array(TokenInfoType);

import { type Xnft } from "../_utils/xnftIDL";
import { type IdlAccounts } from "@project-serum/anchor";

type XnftAccount = IdlAccounts<Xnft>["xnft"];

export default XnftAccount;

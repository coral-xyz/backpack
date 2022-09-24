// adapted from https://github.com/Web3Auth/sign-in-with-solana/blob/master/src/regex.ts

const DOMAIN =
  "(?<domain>([^?#]*)) wants you to sign in with your Solana account:";
const ADDRESS = "\\n(?<address>[a-zA-Z0-9]{32,44})\\n\\n";
const STATEMENT = "((?<statement>[^\\n]+)\\n)?";
const URI = "(([^:?#]+):)?(([^?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))";
const URI_LINE = `\\nURI: (?<uri>${URI}?)`;
const VERSION = "\\nVersion: (?<version>1)";
const CHAIN_ID = "\\nChain ID: (?<chainId>[0-9]+)";
const NONCE = "\\nNonce: (?<nonce>[a-zA-Z0-9]{8,})";
const DATETIME = `([0-9]+)-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])[Tt]([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60)(.[0-9]+)?(([Zz])|([+|-]([01][0-9]|2[0-3]):[0-5][0-9]))`;
const ISSUED_AT = `\\nIssued At: (?<issuedAt>${DATETIME})`;
const EXPIRATION_TIME = `(\\nExpiration Time: (?<expirationTime>${DATETIME}))?`;
const NOT_BEFORE = `(\\nNot Before: (?<notBefore>${DATETIME}))?`;
const REQUEST_ID =
  "(\\nRequest ID: (?<requestId>[-._~!$&'()*+,;=:@%a-zA-Z0-9]*))?";
const RESOURCES = `(\\nResources:(?<resources>(\\n- ${URI}?)+))?`;

const MESSAGE = `^${DOMAIN}${ADDRESS}${STATEMENT}${URI_LINE}${VERSION}${CHAIN_ID}${NONCE}${ISSUED_AT}${EXPIRATION_TIME}${NOT_BEFORE}${REQUEST_ID}${RESOURCES}$`;

export class ParsedMessage {
  domain?: string;
  address?: string;
  statement?: string;
  uri?: string;
  version?: string;
  chainId?: number;
  nonce?: string;
  issuedAt?: Date;
  expirationTime?: Date;
  notBefore?: string;
  requestId?: string;
  resources?: string[];

  constructor(msg: string) {
    const REGEX = new RegExp(MESSAGE, "g");
    const match = REGEX.exec(msg.trim());
    if (!match?.groups) {
      throw new Error("Message did not match the regular expression.");
    }
    this.domain = match.groups.domain;
    this.address = match.groups.address;
    this.statement = match.groups.statement;
    this.uri = match.groups.uri;
    this.version = match.groups.version;
    this.nonce = match.groups.nonce;
    this.chainId = match.groups.chainId
      ? parseInt(match.groups.chainId)
      : undefined;
    this.issuedAt = match.groups.issuedAt
      ? new Date(match.groups.issuedAt)
      : undefined;
    this.expirationTime = match.groups.expirationTime
      ? new Date(match.groups.expirationTime)
      : undefined;
    this.notBefore = match.groups.notBefore;
    this.requestId = match.groups.requestId;
    this.resources = match.groups.resources?.split("\n- ").slice(1);
  }
}

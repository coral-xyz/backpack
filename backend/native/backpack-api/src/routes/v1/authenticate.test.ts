import type { Express } from "express-serve-static-core";
import request from "supertest";

import app from "../../../src";

const validAuthPayload = {
  blockchain: "solana",
  signature:
    "56ESBrm7pnDL5pjoLNMWHD7BKztiEeTxPKXJjc6XHHgM8w7MS2L4waiz7UG9CwjKSnXtou51BwfdjNNw78ppDk5c",
  publicKey: "6TkBZ4F5mRNYrXDmoSofXE6yJLJHwCGpFupkTEQuEhqs",
  message:
    "4cP2Yu38KqhPTXvB76F1B9SP7cFfodaesbggpr1vb9YJMm613ZsqfWepHF1MyLhH6iaCJe",
};

describe("POST /authenticate", () => {
  it.skip("should authenticate with a valid payload", () => {});
  it.skip("should not authenticate with an invalid signed message prefix", (done) => {});
  it.skip("should not authenticate with an invalid signature", (done) => {});
  it.skip("should not authenticate if signed with a public key that does not belong to user", (done) => {});
  it.skip("should not authenticate if signed with an invalid user id", (done) => {});
});

describe("DELETE /authenticate", () => {
  it.skip("should delete a cookie", (done) => {});
});

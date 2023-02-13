import { derivationPathsToIndices, getIndexedPath } from "./crypto";
import { Blockchain } from "./types";

test("gets correct account index for m/44'/501'", () => {
  const paths = ["m/44'/501'"];

  expect(derivationPathsToIndices(paths)).toStrictEqual({
    accountIndex: 0,
    walletIndex: -1,
  });
});

test("gets correct wallet index for max account index", () => {
  const paths = [
    "m/44'/501'/2'/0'",
    "m/44'/501'/0'/0'",
    "m/44'/501'/0'/0'/9'",
    "m/44'/501'/3'/0'/10'",
    "m/44'/501'/1'/0'/5'",
  ];

  expect(derivationPathsToIndices(paths)).toStrictEqual({
    accountIndex: 3,
    walletIndex: 10,
  });
});

test("gets correct next path after m/44'/501'", () => {
  const path = "m/44'/501'";

  const { accountIndex, walletIndex } = derivationPathsToIndices([path]);

  expect(
    getIndexedPath(Blockchain.SOLANA, accountIndex, walletIndex + 1)
  ).toEqual("m/44'/501'/0'/0'");
});

test("gets correct next path after m/44'/501'/0'/0'", () => {
  const path = "m/44'/501'/0'/0'";

  const { accountIndex, walletIndex } = derivationPathsToIndices([path]);

  expect(
    getIndexedPath(Blockchain.SOLANA, accountIndex, walletIndex + 1)
  ).toEqual("m/44'/501'/0'/0'/0'");
});

test("gets correct next path after m/44'/501'/0'/0'/0'", () => {
  const path = "m/44'/501'/0'/0'/0'";

  const { accountIndex, walletIndex } = derivationPathsToIndices([path]);

  expect(
    getIndexedPath(Blockchain.SOLANA, accountIndex, walletIndex + 1)
  ).toEqual("m/44'/501'/0'/0'/1'");
});

test("gets correct next path after m/44'/501'/9'/0'/2'", () => {
  const path = "m/44'/501'/9'/0'/2'";

  const { accountIndex, walletIndex } = derivationPathsToIndices([path]);

  expect(
    getIndexedPath(Blockchain.SOLANA, accountIndex, walletIndex + 1)
  ).toEqual("m/44'/501'/9'/0'/3'");
});

import {
  getAccountRecoveryPaths,
  getIndexedPath,
  nextIndicesFromPaths,
} from "./crypto";
import { Blockchain } from "./types";

test("gets correct account index for m/44'/501'", () => {
  const paths = ["m/44'/501'"];

  expect(nextIndicesFromPaths(paths)).toStrictEqual({
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

  expect(nextIndicesFromPaths(paths)).toStrictEqual({
    accountIndex: 3,
    walletIndex: 11,
  });
});

test("gets correct next path from an array of paths", () => {
  const paths = [
    "m/44'/501'/2'/0'",
    "m/44'/501'/0'/0'",
    "m/44'/501'/0'/0'/9'",
    "m/44'/501'/3'/0'/10'",
    "m/44'/501'/1'/0'/5'",
  ];

  const { accountIndex, walletIndex } = nextIndicesFromPaths(paths);

  expect(getIndexedPath(Blockchain.SOLANA, accountIndex, walletIndex)).toEqual(
    "m/44'/501'/3'/0'/11'"
  );
});

test("gets correct next path after m/44'/501'", () => {
  const path = "m/44'/501'";

  const { accountIndex, walletIndex } = nextIndicesFromPaths([path]);

  expect(getIndexedPath(Blockchain.SOLANA, accountIndex, walletIndex)).toEqual(
    "m/44'/501'/0'/0'"
  );
});

test("gets correct next path after m/44'/501'/0'/0'", () => {
  const path = "m/44'/501'/0'/0'";

  const { accountIndex, walletIndex } = nextIndicesFromPaths([path]);

  expect(getIndexedPath(Blockchain.SOLANA, accountIndex, walletIndex)).toEqual(
    "m/44'/501'/0'/0'/0'"
  );
});

test("gets correct next path after m/44'/501'/0'/0'/0'", () => {
  const path = "m/44'/501'/0'/0'/0'";

  const { accountIndex, walletIndex } = nextIndicesFromPaths([path]);

  expect(getIndexedPath(Blockchain.SOLANA, accountIndex, walletIndex)).toEqual(
    "m/44'/501'/0'/0'/1'"
  );
});

test("gets correct next path after m/44'/501'/9'/0'/2'", () => {
  const path = "m/44'/501'/9'/0'/2'";

  const { accountIndex, walletIndex } = nextIndicesFromPaths([path]);

  expect(getIndexedPath(Blockchain.SOLANA, accountIndex, walletIndex)).toEqual(
    "m/44'/501'/9'/0'/3'"
  );
});

test("gets correct account recovery paths for Solana", () => {
  const recoveryPaths = getAccountRecoveryPaths(Blockchain.SOLANA, 0);
  expect(recoveryPaths[0]).toEqual("m/44'/501'/0'/0'");
  expect(recoveryPaths[1]).toEqual("m/44'/501'/0'/0'/0'");
  expect(recoveryPaths[2]).toEqual("m/44'/501'/0'/0'/1'");
  expect(recoveryPaths[3]).toEqual("m/44'/501'/0'/0'/2'");
});

test("gets correct account recovery paths for Ethereum", () => {
  const recoveryPaths = getAccountRecoveryPaths(Blockchain.ETHEREUM, 0);
  expect(recoveryPaths[0]).toEqual("m/44'/60'/0'/0'");
  expect(recoveryPaths[1]).toEqual("m/44'/60'/0'/0'/0'");
  expect(recoveryPaths[2]).toEqual("m/44'/60'/0'/0'/1'");
  expect(recoveryPaths[3]).toEqual("m/44'/60'/0'/0'/2'");
});

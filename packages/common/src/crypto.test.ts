import { derivationPathsToIndices } from "./crypto";

test("gets correct account index for m/44/501/", () => {
  const paths = ["m/44'/501'"];

  expect(derivationPathsToIndices(paths)).toStrictEqual({
    accountIndex: 0,
    walletIndex: undefined,
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
    walletIndex: 11,
  });
});

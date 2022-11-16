#!/usr/bin/env zx

import jwt from "jsonwebtoken";

const filePath = await question(chalk.magenta(`path to ${chalk.underline(".key")} file (including the filename): `));

const privateKey = (await fs.readFile(filePath)).toString();

const role = await question(chalk.magenta(`hasura ${chalk.underline("role")} name: `));

const token = await jwt.sign(
  {
    "https://hasura.io/jwt/claims": {
      "x-hasura-allowed-roles": [role],
      "x-hasura-default-role": role,
    },
  },
  privateKey,
  { algorithm: "RS256" }
);

console.log(token);

// https://github.com/depcheck/depcheck
import chalk from "chalk";
import depcheck from "depcheck";

const options = {
  ignoreBinPackage: false,
  skipMissing: false,
  specials: [
    // the target special parsers
    depcheck.special.eslint,
    depcheck.special.webpack,
    depcheck.special.babel,
    depcheck.special.husky,
    depcheck.special.bin,
  ],
  ignoreMatches: [
    "form-data",
    "@graphql-codegen/cli",
    "@graphql-codegen/client-preset",
    "@types/node",
    "typescript",
  ],
};

const cwd = process.cwd();
const location = process.argv[2];
const dir = `${cwd}/${location}`;

if (!location || dir.includes("undefined")) {
  throw new Error("Please provide a path to packages/*");
}

const IGNORE_MAP = {
  "data-components": new Set(["@graphql-typed-document-node/core"]),
  "app-extension": new Set([
    "react-native",
    "@coral-xyz/provider-core",
    "@coral-xyz/provider-injection",
  ]),
  common: new Set(["ts-jest"]),
  "app-mobile": new Set([
    "~src",
    "~assets",
    "metro-cache",
    "react-native-ble-plx",
    "expo-build-properties",
    "uuid",
    "expo-font",
    "expo-screen-orientation",
    "expo-localization",
    "buffer",
    "crypto-browserify",
    "@coral-xyz/background",
    "@coral-xyz/provider-injection",
  ]),
};

depcheck(dir, options).then((unused) => {
  const path = getProjectName(dir);
  const ignoreMap = IGNORE_MAP[path];

  const hasUnusuedDeps = getHasIgnoredDeps(unused.dependencies, ignoreMap);
  const hasUnusuedDevDeps = getHasIgnoredDeps(
    unused.devDependencies,
    ignoreMap
  );
  const hasMissingDeps = getMissingDeps(unused.missing, ignoreMap);

  if (!hasUnusuedDeps && !hasUnusuedDevDeps && !hasMissingDeps) {
    console.log(
      chalk.green(`✓ depcheck packages/${path}: no missing packages`)
    );
    return;
  }

  console.log(chalk.blue(`depcheck packages/${path}:`));

  if (hasUnusuedDeps) {
    console.log(
      chalk.yellow("unused dependencies:", `(${unused.dependencies.length})`)
    );
    const deps = unused.dependencies.filter((dep) => !ignoreMap?.has(dep));
    console.log(deps.join(" ")); // an array containing the unused dependencies
  }

  if (hasUnusuedDevDeps) {
    console.log(
      chalk.yellow(
        "unused devDependencies:",
        `(${unused.devDependencies.length})`
      )
    );
    const deps = unused.dependencies.filter((dep) => !ignoreMap?.has(dep));
    console.log(deps.join(" ")); // an array containing the unused dependencies
  }

  if (hasMissingDeps) {
    const missing = processMissing(unused.missing, ignoreMap);
    console.log(chalk.red("ERROR: MISSING dependencies!"));
    missing.forEach((item) => {
      console.log(chalk.red(`${item.key}:`));
      console.log("used in:", item.locations);
    });
    process.exit(1);
  }

  // if (Object.keys(unused.invalidFiles).length > 0) {
  //   console.log(chalk.yellow("invalid files"));
  //   console.log(unused.invalidFiles); // an array containing the unused devDependencies
  // }

  console.log("                                   ");
  console.log("===================================");
  console.log("                                   ");

  // console.log(unused.using); // a lookup indicating each dependency is used by which files
  // console.log(unused.invalidFiles); // files that cannot access or parse
  // console.log(unused.invalidDirs); // directories that cannot access
});

const getProjectName = (dir: string) => {
  const name = dir.split("/packages/")[1];
  return name;
};

type IgnoreMap = Set<string>;
const getMissingDeps = (
  unused: {
    [key: string]: string[];
  },
  ignoreMap: IgnoreMap
): boolean => {
  if (Object.keys(unused).length === 0) {
    return false;
  }

  for (const [key, _value] of Object.entries(unused)) {
    if (ignoreMap?.has(key)) {
      continue;
    } else {
      return true;
    }
  }

  return false;
};

const getHasIgnoredDeps = (unused: any[], ignoreMap: IgnoreMap): boolean => {
  if (unused.length === 0) {
    return false;
  }

  let count = 0;
  for (const key of unused) {
    if (!ignoreMap?.has(key)) {
      count++;
    }
  }

  return count > 0;
};

type Missing = {
  key: string;
  locations: string[];
};

const processMissing = (
  unused: { [key: string]: string[] },
  ignoreMap: IgnoreMap
) => {
  const missing: Missing[] = [];

  for (const [key, value] of Object.entries(unused)) {
    if (ignoreMap?.has(key)) {
      continue;
    } else {
      missing.push({
        key,
        locations: value.slice(0, 4).map((l) => l.split("/packages/")[1]),
      });
    }
  }

  return missing;
};

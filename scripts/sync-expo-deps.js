const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const isCi = process.env.CI === "true";

if (isCi) {
  process.exit(0);
}

const dryRun = process.argv.includes("--dry-run");
const appMobilePackagePath = path.join(
  "packages",
  "app-mobile",
  "package.json"
);

const appMobilePackage = JSON.parse(
  fs.readFileSync(appMobilePackagePath, "utf8")
);

const PACKAGES = new Set(["@gorhom/bottom-sheet"]);
const directories = ["packages/*", "examples/xnft/*"];

const appMobileDeps = Object.entries(appMobilePackage.dependencies).filter(
  ([key]) =>
    key.includes("@tanstack/") ||
    key.includes("expo") ||
    key.includes("react-native") ||
    key.includes("tamagui") ||
    key.includes("shopify") ||
    key.includes("unimodules") ||
    PACKAGES.has(key)
);

let hasChanges = false;

(async function main() {
  directories.forEach((dir) => {
    const packagePaths = execSync(`ls ${dir}/package.json`, {
      encoding: "utf-8",
    })
      .split("\n")
      .filter(Boolean);

    packagePaths.forEach((packagePath) => {
      if (packagePath === "packages/app-mobile/package.json") {
        return;
      }

      const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

      ["dependencies", "devDependencies", "peerDependencies"].forEach(
        (depType) => {
          if (packageJson[depType]) {
            let changes = {};

            Object.entries(packageJson[depType]).forEach(([key, value]) => {
              const appMobileVersion = appMobileDeps.find(
                ([k]) => k === key
              )?.[1];
              if (appMobileVersion && appMobileVersion !== value) {
                changes[key] = appMobileVersion;
              }
            });

            if (Object.keys(changes).length > 0) {
              hasChanges = true;

              if (dryRun) {
                console.log(
                  `\x1b[31m✗\x1b[0m Mobile deps: The following changes would be made to ${packagePath}.`
                );
                console.log(changes);
                console.log(
                  `\x1b[33m→\x1b[0m Run without --dry-run to apply them. Then run yarn`
                );
              } else {
                packageJson[depType] = { ...packageJson[depType], ...changes };
                fs.writeFileSync(
                  packagePath,
                  JSON.stringify(packageJson, null, 2) + "\n"
                );
                console.log(`Updated ${packagePath}. Now run yarn.`);
                console.log(changes);
              }
            }
          }
        }
      );
    });
  });

  if (dryRun && hasChanges) {
    process.exit(1);
  }
})();

// this pulls down the pinned versions for an sdk-version and makes sure the mobile app has them installed
// Same as running `npx expo install --fix` within the app-mobile directory.
// https://github.com/expo/expo/blob/sdk-50/packages/expo/bundledNativeModules.json
async function _fetchBundledNativeModulesForSdkVersion(version) {
  const url = `https://raw.githubusercontent.com/expo/expo/sdk-${version}/packages/expo/bundledNativeModules.json`;
  try {
    const data = await fetch(url).then((r) => r.json());
    return data;
  } catch (error) {
    console.error("error fetching bundledNativeModules.json, skipping...");
    return {};
  }
}

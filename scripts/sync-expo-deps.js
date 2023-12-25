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
  (() => {
    try {
      return fs.readFileSync(appMobilePackagePath, "utf8");
    } catch {
      return '{ "dependencies": {} }';
    }
  })()
);

const appMobileDeps = Object.entries(appMobilePackage.dependencies).filter(
  ([key]) =>
    key.startsWith("expo") ||
    // TODO remove this once we have a new version of react-native-svg
    (key.startsWith("react-native") && key !== "react-native-svg")
);

let hasChanges = false;

const directories = ["packages/*", "examples/xnft/*"];

directories.forEach((dir) => {
  const packagePaths = execSync(`ls ${dir}/package.json`, { encoding: "utf-8" })
    .split("\n")
    .filter(Boolean);

  packagePaths.forEach((packagePath) => {
    if (packagePath === "packages/app-extension/package.json") {
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
                JSON.stringify(packageJson, null, 2)
              );
              console.log(`Updated ${packagePath}`);
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

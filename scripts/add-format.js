const fs = require("fs");
const path = require("path");

const packagesDirectory = "./packages"; // Change this to your packages directory path

// Function to add the "format" script to a package.json file
function addFormatScript(packageJsonPath) {
  try {
    const absolutePath = path.resolve(packageJsonPath); // Get the absolute path
    const packageJson = require(absolutePath);
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    packageJson.scripts.format = `npx prettier --write --config ../../.prettierrc --ignore-path ../../.prettierignore --log-level error`; // Adjust the prettier command as needed
    packageJson.scripts["format:all"] =
      `yarn format '**/*.{js,jsx,ts,tsx}' --cache`; // Adjust the prettier command as needed
    fs.writeFileSync(absolutePath, JSON.stringify(packageJson, null, 2));
    console.log(`Added "format" script to ${absolutePath}`);
  } catch (error) {
    console.error(
      `Error adding "format" script to ${packageJsonPath}: ${error.message}`
    );
  }
}

const SKIP = new Set(["wallet-standard", "xnft-cli"]);

// Function to process package.json files in the top-level directory only
function processTopLevelPackageJsonFiles(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const filePath = path.join(directory, file, "package.json");
    if (filePath.endsWith("package.json") && !SKIP.has(file)) {
      addFormatScript(filePath);
    }
  }
}

// Start processing package.json files in the top-level packages directory
processTopLevelPackageJsonFiles(packagesDirectory);

const fs = require("fs/promises");

const { LOCIZE_API_KEY, LOCIZE_NAMESPACE, LOCIZE_PROJECT_ID } = process.env;
const LOCALE_FILES_PATH = "./src/locales";

const cmd = process.argv[2];

switch (cmd) {
  case "process-translation-files":
    processTranslationFiles();
    break;
  case "upload-english-file":
    uploadEnglishFile();
    break;
  case "fetch-and-process-translation-files":
    fetchAndProcessTranslationFiles();
    break;
  default:
    console.error(`Unknown command '${cmd}'`);
    process.exit(1);
}

async function processTranslationFiles() {
  let files = process.argv.slice(3);

  if (files.length === 0) {
    files = (await fs.readdir("./src/locales")).map(
      (file) => `./src/locales/${file}`
    );
  }

  const enKeys = new Set(getAllKeys(require("./src/locales/en.json")));

  for (const file of files) {
    const inputJSON = JSON.parse(await fs.readFile(file));

    // 1/3) Check all keys are snake_case and not too deeply nested

    try {
      verifyAllKeysAreSnakeCase(inputJSON);
    } catch (err) {
      throw new Error(`(${file.split("/").pop()}): ${err.message}`);
    }

    // 2/3) Check file doesn't have any additional keys that aren't present in en.json

    if (!file.endsWith("en.json")) {
      getAllKeys(inputJSON).forEach((key) => {
        if (!enKeys.has(key)) {
          throw new Error(
            `(${file.split("/").pop()}): '${key}' is missing from en.json ${enKeys.size}`
          );
        }
      });
    }

    // 3/3) Alphabetically sort and format the JSON file

    try {
      const outputJSON = recursivelySort(inputJSON);
      await fs.writeFile(
        file,
        JSON.stringify(outputJSON, null, 2).concat("\n")
      );
    } catch (err) {
      console.error(`Error sorting ${file}: ${err.message}`);
    }

    console.log(`✅ Processed ${file}`);
  }
}

async function uploadEnglishFile() {
  verifyEnvVarsExist();
  const en = JSON.parse(
    await fs.readFile(`${LOCALE_FILES_PATH}/en.json`, "utf-8")
  );

  const body = JSON.stringify(flattenNestedObject(en));

  await fetch(
    `https://api.locize.app/missing/${LOCIZE_PROJECT_ID}/latest/en/${LOCIZE_NAMESPACE}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOCIZE_API_KEY}`,
      },
      body,
    }
  )
    .then((x) => x.json())
    .then(console.log);
}

async function fetchAndProcessTranslationFiles() {
  verifyEnvVarsExist();
  const languages = await fetch(
    `https://api.locize.app/languages/${LOCIZE_PROJECT_ID}`
  ).then((x) => x.json());

  for (const [LANG, { isReferenceLanguage }] of Object.entries(languages)) {
    if (isReferenceLanguage) continue;

    const translations = await fetch(
      `https://api.locize.app/${LOCIZE_PROJECT_ID}/latest/${LANG}/${LOCIZE_NAMESPACE}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LOCIZE_API_KEY}`,
        },
      }
    ).then((x) => x.json());

    await fs.writeFile(
      `${LOCALE_FILES_PATH}/${LANG}.json`,
      JSON.stringify(translations, null, 2).concat("\n")
    );
    console.log(`📝 Overwrote ${LOCALE_FILES_PATH}/${LANG}.json`);
  }

  await processTranslationFiles();
}

// Utility functions ------------------------------------------------------------

function getAllKeys(obj, path = []) {
  return Object.keys(obj).reduce((acc, key) => {
    if (obj[key] instanceof Object) {
      return acc.concat(getAllKeys(obj[key], path.concat(key)));
    } else {
      return acc.concat(path.concat(key).join("."));
    }
  }, []);
}

function verifyAllKeysAreSnakeCase(obj, path = []) {
  for (let key in obj) {
    if (obj[key] instanceof Object) {
      verifyAllKeysAreSnakeCase(obj[key], path.concat(key));
    } else {
      if (!key.match(/^[a-z0-9]+([_.][a-z0-9]+)*$/)) {
        throw new Error(`'${path.concat(key).join(".")}' is not snake_case`);
      } else if (path.length > 1) {
        throw new Error(
          `'${path.concat(key).join(".")}' is too deeply nested, only one level of nesting is allowed for now`
        );
      }
    }
  }
}

function recursivelySort(obj) {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }
  return Object.keys(obj)
    .sort((a, b) => a.localeCompare(b, "en"))
    .reduce((acc, key) => {
      acc[key] = recursivelySort(obj[key]);
      return acc;
    }, {});
}

// Flatten nested object so that keys are separated by dots
function flattenNestedObject(obj, prefix = "") {
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + "." : "";
    if (typeof obj[k] === "object" && obj[k] !== null) {
      Object.assign(acc, flattenNestedObject(obj[k], pre + k));
    } else {
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {});
}

function verifyEnvVarsExist() {
  if (!LOCIZE_API_KEY || !LOCIZE_NAMESPACE || !LOCIZE_PROJECT_ID) {
    console.error(
      "LOCIZE_API_KEY, LOCIZE_NAMESPACE and LOCIZE_PROJECT_ID must be in Env"
    );
    process.exit(1);
  }
}

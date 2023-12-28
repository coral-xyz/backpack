require("dotenv").config();
const Airtable = require("airtable");
const fs = require("fs").promises;
const path = require("path");

const VIEW_NAME = process.env.VIEW_NAME;
const BASE_ID = process.env.BASE_ID;
const API_KEY = process.env.API_KEY;

const base = new Airtable({ apiKey: API_KEY }).base(BASE_ID);

// Fetch data from Airtable
async function fetchDataFromAirtable() {
  return new Promise((resolve, reject) => {
    let records = [];
    base(process.env.TABLE_NAME)
      .select({ view: VIEW_NAME })
      .eachPage(
        function page(recordsBatch, fetchNextPage) {
          records = records.concat(recordsBatch.map((record) => record.fields));
          fetchNextPage();
        },
        function done(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve(records);
        }
      );
  });
}

// Convert flat keys with dot notation into nested objects
function unflatten(obj) {
  const result = {};

  for (const key of Object.keys(obj)) {
    let current = result;
    const parts = key.split(".");

    for (const part of parts.slice(0, -1)) {
      current = current[part] = current[part] || {};
    }

    current[parts[parts.length - 1]] = obj[key];
  }

  return result;
}

// Process data to organize it by language
function processAirtableData(records) {
  const translationsByLanguage = {};
  const allLanguages = new Set();

  // Identify all languages present in the records
  records.forEach((record) => {
    Object.keys(record).forEach((lang) => {
      if (lang !== "key") {
        allLanguages.add(lang);
      }
    });
  });

  // Process each record, ensuring all languages are present
  records.forEach((record) => {
    allLanguages.forEach((lang) => {
      if (!translationsByLanguage[lang]) {
        translationsByLanguage[lang] = {};
      }
      // Add the translation for this language, or an empty string if not present
      translationsByLanguage[lang][record.key] = record[lang] || "";
    });
  });

  return translationsByLanguage;
}

// Function to update the .ts files
async function updateTsFiles(translationsByLanguage, englishTranslationsPath) {
  for (const [lang, translations] of Object.entries(translationsByLanguage)) {
    const filePath = path.join(
      __dirname,
      `../packages/i18n/src/locales/${lang}/translation.ts`
    );
    const nestedTranslations = unflatten(translations);

    // Include import statement for EnglishTranslations
    let fileContent = "";
    if (lang !== "en") {
      fileContent += `import { type DeepPartial } from "../../partial";\n`;
      // Assuming 'en' is your base language
      fileContent += `import type EnglishTranslations from "${englishTranslationsPath}";\n\n`;
      fileContent += `const Translations: DeepPartial<typeof EnglishTranslations> = ${JSON.stringify(
        nestedTranslations,
        replacer,
        2
      )};\n`;
    } else {
      fileContent += `const Translations = ${JSON.stringify(
        nestedTranslations,
        replacer,
        2
      )};\n`;
    }

    fileContent += "export default Translations;\n";
    await fs.writeFile(filePath, fileContent);
  }
}

// Remove all empty strings and empty objects from the JSON
const replacer = (_key, val) => {
  if (
    val === "" ||
    (typeof val === "object" && Object.values(val).every((v) => !v))
  ) {
    return undefined;
  } else {
    return val;
  }
};

// Main function to execute the process
async function main() {
  try {
    const records = await fetchDataFromAirtable();
    const translationsByLanguage = processAirtableData(records);
    const englishTranslationsPath = "../en/translation"; // Adjust the relative path as needed
    await updateTsFiles(translationsByLanguage, englishTranslationsPath);
    console.log("Translation files updated successfully.");
  } catch (err) {
    console.error("Error:", err);
  }
}

main();

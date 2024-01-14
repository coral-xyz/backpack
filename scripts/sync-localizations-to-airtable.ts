require("dotenv").config();
const Airtable = require("airtable");
const path = require("path");
const glob = require("glob");

const VIEW_NAME = process.env.VIEW_NAME;
const TABLE_NAME = process.env.TABLE_NAME;
const BASE_ID = process.env.BASE_ID;
const API_KEY = process.env.API_KEY;
const PATH = "packages/i18n/src/locales/*/*.ts";

const base = new Airtable({ apiKey: API_KEY }).base(BASE_ID);

// Interfaces for translations
interface Translation {
  [key: string]: string | Translation;
}

interface TranslationFile {
  language: string;
  translations: Translation;
}

// Function to read and process translation files
async function readTranslationFile(file: string): Promise<TranslationFile> {
  const absolutePath = path.join(__dirname, "..", file);
  const module = await import(absolutePath);
  return {
    language: path.basename(path.dirname(file)),
    translations: module.default,
  };
}

// Function to flatten nested translations
function flattenTranslations(
  translations: Translation,
  prefix = ""
): { [key: string]: string } {
  return Object.keys(translations).reduce((acc, key) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof translations[key] === "object") {
      Object.assign(
        acc,
        flattenTranslations(translations[key] as Translation, fullKey)
      );
    } else {
      acc[fullKey] = translations[key] as string;
    }
    return acc;
  }, {} as { [key: string]: string });
}

// Function to create Airtable record structure
function createAirtableRecordStructure(
  files: TranslationFile[]
): { fields: Record<string, string> }[] {
  const allKeys = new Set<string>();
  const translationsByLanguage = {};

  // First, collect all unique keys across all languages
  files.forEach((file) => {
    const flattenedTranslations = flattenTranslations(file.translations);
    for (const key in flattenedTranslations) {
      allKeys.add(key);
    }
    translationsByLanguage[file.language] = flattenedTranslations;
  });

  // Then, create records ensuring all keys are included for each language
  return Array.from(allKeys).map((key) => {
    const record = { key: key };
    Object.keys(translationsByLanguage).forEach((lang) => {
      // Include the key for each language, or an empty string if key is missing
      record[lang] = translationsByLanguage[lang][key] || "";
    });
    return { fields: record };
  });
}

// Modified function to upload records to Airtable
async function uploadToAirtable(records: { fields: Record<string, string> }[]) {
  const data = await fetchDataFromAirtable();
  const recordMap = new Map();
  data.forEach((record) => {
    recordMap.set(record.key, record);
  });

  const recordsToUpdate: Array<{
    id: string;
    fields: { [key: string]: string };
  }> = [];
  const recordsToCreate: Array<{ fields: { [key: string]: string } }> = [];

  for (const record of records) {
    const key = record.fields.key;
    const existingRecord = recordMap.get(key);

    try {
      if (existingRecord?.id) {
        const isSameRecord = Object.keys(record.fields).every((key) => {
          if (record.fields[key] === "") {
            return true;
          }

          const isSame = record.fields[key] === existingRecord[key];
          if (!isSame) {
            console.log("airtable has different values, skipping...");
            console.table({
              key: record.fields.key,
              local: record.fields[key],
              airtable: existingRecord[key],
            });
          }

          return isSame;
        });

        if (!isSameRecord) {
          recordsToUpdate.push({
            id: existingRecord.id,
            fields: record.fields,
          });
        } else {
          // console.log(
          //   `Skipped updating record for key: ${key} as it is identical`
          // );
        }
      } else {
        recordsToCreate.push({
          fields: record.fields,
        });
      }
    } catch (err) {
      console.error("Error in record operation:", err);
    }
  }

  // Split recordsToUpdate and recordsToCreate into chunks and process in batches
  const batchSize = 10; // Set your preferred batch size here
  const updateChunks = chunkArray(recordsToUpdate, batchSize);
  const createChunks = chunkArray(recordsToCreate, batchSize);
  console.log("# to create", recordsToCreate.length);
  console.log("# to update", recordsToUpdate.length);

  // for (const chunk of updateChunks) {
  //   try {
  //     const updatedRecords = await base(TABLE_NAME).update(chunk);
  //     console.log(
  //       `Updated: ${updatedRecords
  //         .map((record) => {
  //           const id = record.getId();
  //           const key = record.get("key");
  //           return `${key}: ${id}`;
  //         })
  //         .join(", ")}`
  //     );
  //   } catch (error) {
  //     console.error("Error updating chunk:", error);
  //   }
  // }

  for (const chunk of createChunks) {
    try {
      const createdRecords = await base(TABLE_NAME).create(chunk, {
        typecast: true,
      });
      console.log(
        `Created: ${createdRecords.map((record) => record.getId()).join(", ")}`
      );
    } catch (error) {
      console.error("Error creating chunk:", error);
    }
  }
}

function chunkArray(array: any[], chunkSize = 10) {
  const chunks: typeof array = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

async function fetchDataFromAirtable(): Promise<{ [key: string]: any }[]> {
  return new Promise((resolve, reject) => {
    let records = [];
    base(TABLE_NAME)
      .select({ view: VIEW_NAME })
      .eachPage(
        function page(recordsBatch, fetchNextPage) {
          records = records.concat(
            recordsBatch.map((record) => {
              return {
                ...record.fields,
                id: record.id,
              };
            })
          );
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

async function main() {
  // Main function to process and upload translations
  glob(PATH, async (err: Error | null, files: string[]) => {
    if (err) {
      console.error("Error reading files:", err);
      return;
    }

    const translationFiles = await Promise.all(
      files.map((file) => readTranslationFile(file))
    );
    const records = createAirtableRecordStructure(translationFiles);

    if (process.argv.includes("--dry-run")) {
      console.table(
        records.map(({ fields }) =>
          Object.entries(fields).reduce((acc, [k, v]) => {
            acc[k] = v.length > 20 ? `${v.slice(0, 20)}...` : v;
            return acc;
          }, {})
        )
      );
    } else {
      uploadToAirtable(records);
    }
  });
}

main();
